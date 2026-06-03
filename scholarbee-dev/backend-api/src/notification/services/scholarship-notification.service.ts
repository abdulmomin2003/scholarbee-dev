import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationCategory,
  NavigationTypeEnum,
} from '../schemas/notification.schema';
import {
  NotificationReadReceipt,
  NotificationReadReceiptDocument,
} from '../schemas/notification-read-receipt.schema';
import { NotificationGateway } from '../notification.gateway';
import { NotificationBuilder } from '../utils/notification.builder';
import { NotificationService } from './notfication.service';
import { ScholarshipNotificationWebhookDto } from 'src/webhooks/dto/notification-webhook.dto';
import { stringToObjectId } from 'src/utils/db.utils';
import { Scholarship, ScholarshipDocument } from 'src/scholarships/schemas/scholarship.schema';

@Injectable()
export class ScholarshipNotificationService extends NotificationService {
  constructor(
    @InjectModel(Notification.name)
    notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationReadReceipt.name)
    notificationReadReceiptModel: Model<NotificationReadReceiptDocument>,
    notificationGateway: NotificationGateway,
    @InjectModel(Scholarship.name)
    private readonly scholarshipModel: Model<ScholarshipDocument>,
  ) {
    super(notificationModel, notificationReadReceiptModel, notificationGateway);
  }

  /**
   * Creates a notification when a new scholarship is added
   * @param scholarship The scholarship data from webhook
   * @returns The created notification document
   */
  async scholarshipCreated(
    scholarship: ScholarshipNotificationWebhookDto,
  ): Promise<NotificationDocument> {
    try {
      // Fetch scholarship to get image_url
      const scholarshipDoc = await this.scholarshipModel
        .findById(scholarship.scholarship_id)
        .select('image_url')
        .exec();
      
      const imageUrl = scholarshipDoc?.image_url;

      // Format amount for display
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(scholarship.amount);

      const notificationDoc = new NotificationBuilder()
        .setTitle('New Scholarship Available')
        .setMessage(
          `A new ${scholarship.scholarship_type} scholarship "${scholarship.scholarship_name}" worth ${formattedAmount} has been added by ${scholarship.organization.name}. Apply now!`,
        )
        .setCategory(NotificationCategory.SCHOLARSHIP)
        .setNavigation(
          NavigationTypeEnum.SCHOLARSHIP,
          stringToObjectId(scholarship.scholarship_id),
        )
        .setGlobalUserAudience()
        .setImageUrl(imageUrl)
        .build();

      // Persist notification in the database
      const savedNotification =
        await this.notificationModel.create(notificationDoc);

      // Emit real-time notification to all student users
      this.notificationGateway.emitUserGlobalNotification(
        this.sanitizeNotification(savedNotification),
      );

      return savedNotification;
    } catch (error) {
      console.error('Error creating scholarship notification:', error);
      throw new Error(
        `Failed to create scholarship notification: ${error.message}`,
      );
    }
  }
}
