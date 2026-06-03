import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { ConversationParticipantType } from './schemas/conversation.schema';
import { User, UserDocument, UserNS } from '../users/schemas/user.schema';
import { TemplateRendererService } from 'src/email-templates/services/template-renderer.service';
import { EmailTemplateId } from 'src/email-templates/types/template.types';
import { EmailService } from 'src/email/email.service';
import { IConfiguration } from 'src/config/configuration';

/** Shape of one result row returned by aggregateUnreadCountsPerCampus */
interface UnreadCountPerCampus {
  _id: Types.ObjectId; // campus_id
  total_unread: number;
}

@Injectable()
export class ChatCronService {
  private readonly logger = new Logger(ChatCronService.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly templateRenderer: TemplateRendererService,
    private readonly configService: ConfigService<IConfiguration>,
    private readonly emailService: EmailService,
  ) { }

  /**
   * Runs every day at UTC midnight (05:00 PKT).
   * For every campus that has unread student messages, sends a reminder email
   * to all admins of that campus stating how many unread messages they have.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'send-unread-messages-notifications',
    timeZone: 'UTC',
  })
  async sendUnreadMessageNotifications(): Promise<void> {
    this.logger.log('Starting unread messages notification job...');

    try {
      // 1. Find every campus that currently has unread student messages,
      //    along with the total count of those messages.
      const unreadByCampus = await this.aggregateUnreadCountsPerCampus();

      if (unreadByCampus.length === 0) {
        this.logger.log('No unread messages found. No notifications will be sent.');
        return;
      }

      this.logger.log(
        `Found ${unreadByCampus.length} campus(es) with unread messages. Fetching admins...`,
      );

      // 2. Fetch all admin users who belong to the affected campuses in a single query.
      //    We only need admins who have an email address to send to.
      const campusIds = unreadByCampus.map((row) => row._id);
      const admins = await this.userModel
        .find({
          user_type: { $in: [UserNS.UserType.Campus_Admin, UserNS.UserType.Super_Admin] },
          campus_id: { $exists: true, $in: campusIds },
          email: { $exists: true, $ne: null },
        })
        .lean();

      // 3. Build a lookup map: campusId (string) → list of admins for that campus.
      //    This avoids an O(n²) nested loop when pairing campuses with their admins.
      const adminsByCampus = new Map<string, typeof admins>();
      for (const admin of admins) {
        // campus_id is guaranteed to exist here because of the $exists: true filter above,
        // but TypeScript types it as optional in the schema — skip any that slipped through.
        if (!admin.campus_id) continue;

        const key = admin.campus_id.toString();
        if (!adminsByCampus.has(key)) adminsByCampus.set(key, []);
        adminsByCampus.get(key)!.push(admin);
      }

      const dashboardUrl =
        this.configService.get('frontend.url', { infer: true }) ?? '';
      let successCount = 0;
      let failCount = 0;

      // 4. For each campus with unread messages, send one email per admin.
      //    Emails are sent sequentially (one after another). If a single email fails,
      //    the error is logged and we continue with the remaining admins — a failure
      //    for one admin never blocks others from receiving their notification.
      for (const { _id: campusId, total_unread } of unreadByCampus) {
        const campusAdmins = adminsByCampus.get(campusId.toString()) ?? [];

        for (const admin of campusAdmins) {
          try {
            const { subject, html } = await this.templateRenderer.renderTemplate(
              EmailTemplateId.CHAT_UNREAD_MESSAGES,
              {
                adminName: admin.first_name,
                unreadCount: total_unread,
                dashboardUrl,
              },
            );

            await this.emailService.send({ to: admin.email, subject, html });
            successCount++;
          } catch (err) {
            this.logger.error(
              `Failed to send unread notification to admin ${admin._id} (${admin.email}): ${err.message}`,
            );
            failCount++;
          }
        }
      }

      this.logger.log(
        `Unread messages notification job complete. Sent: ${successCount}, Failed: ${failCount}.`,
      );
    } catch (error) {
      this.logger.error(
        'Unread messages notification job encountered a fatal error:',
        error.stack,
      );
    }
  }

  /**
   * Aggregates the total count of unread student messages grouped by campus.
   *
   * Pipeline logic (step by step):
   *   1. Filter `messages` collection: only messages sent by students
   *      (`sender_type: 'user'`) that haven't been read by the campus yet
   *      (`is_read_by_campus: false`).
   *   2. Group those messages by `conversation_id` to get a subtotal per conversation.
   *      This intermediate grouping reduces the number of documents the next stage
   *      needs to process.
   *   3. Join each conversation_id with the `conversations` collection to get
   *      the `campus_id` for that conversation.
   *   4. Discard any soft-deleted conversations (`_deleted: true`).
   *   5. Group by `campus_id`, summing the per-conversation subtotals to get
   *      the grand total of unread messages per campus.
   *
   * @returns Array of `{ _id: campusObjectId, total_unread: number }`,
   *          one entry per campus that has at least one unread student message.
   *          Returns an empty array if no unread messages exist anywhere.
   */
  private async aggregateUnreadCountsPerCampus(): Promise<UnreadCountPerCampus[]> {
    return this.messageModel.aggregate<UnreadCountPerCampus>([
      // Step 1: Only unread messages sent by students
      {
        $match: {
          sender_type: ConversationParticipantType.USER,
          is_read_by_campus: false,
        },
      },
      // Step 2: Subtotal per conversation (reduces intermediate document count for the next join)
      {
        $group: {
          _id: '$conversation_id',
          unread_count: { $sum: 1 },
        },
      },
      // Step 3: Bring in the campus_id from the conversations collection
      {
        $lookup: {
          from: 'conversations',
          localField: '_id',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      { $unwind: '$conversation' },
      // Step 4: Exclude soft-deleted conversations
      { $match: { 'conversation._deleted': { $ne: true } } },
      // Step 5: Grand total per campus
      {
        $group: {
          _id: '$conversation.campus_id',
          total_unread: { $sum: '$unread_count' },
        },
      },
    ]);
  }
}
