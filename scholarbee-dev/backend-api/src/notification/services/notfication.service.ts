import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, RootFilterQuery, Types } from 'mongoose';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { UserNS } from 'src/users/schemas/user.schema';
import {
  CreateCampusGlobalNotificationDto,
  CreateCampusSpecificNotificationsDto,
  CreateGlobalNotificationDto,
  CreateSpecificNotificationDto,
} from '../dto/create-notification.dto';
import {
  NotificationQuery,
  QueryNotificationDto,
} from '../dto/query-notification.dto';
import {
  NotificationReadReceipt,
  NotificationReadReceiptDocument,
} from '../schemas/notification-read-receipt.schema';
import {
  AudienceType,
  Notification,
  NotificationCategory,
  NotificationDocument,
} from '../schemas/notification.schema';
import { NotificationBuilder } from '../utils/notification.builder';
import { getSortOrder } from 'src/utils/db.utils';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    protected notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationReadReceipt.name)
    protected notificationReadReceiptModel: Model<NotificationReadReceiptDocument>,
    protected readonly notificationGateway: NotificationGateway,
  ) { }

  protected sanitizeNotification(notification: NotificationDocument) {
    const notificationObject = notification.toObject<Notification>();
    return {
      _id: notificationObject._id,
      title: notificationObject.title,
      message: notificationObject.message,
      audience: {
        audienceType: notificationObject.audience.audienceType,
        isGlobal: notificationObject.audience.isGlobal,
      },
      category: notificationObject.category,
      navigation: notificationObject.navigation,
      priority: notificationObject.priority,
    };
  }

  // Creates a global notification for all users
  async createGlobalUserNotification(
    createGlobalNotificationDto: CreateGlobalNotificationDto,
  ): Promise<NotificationDocument> {
    // TODO: Send the global notification to all users active on the platform (through the gateway)

    try {
      const notificationDoc = new NotificationBuilder()
        .setTitle(createGlobalNotificationDto.title)
        .setMessage(createGlobalNotificationDto.message)
        .setCategory(NotificationCategory.SYSTEM)
        .setGlobalUserAudience()
        .build();

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();
      // Emit to all active users via gateway
      this.notificationGateway.emitUserGlobalNotification(
        this.sanitizeNotification(savedNotification),
      );
      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // Creates a notification for specific users
  async createSpecificUsersNotification(
    createSpecificNotificationDto: CreateSpecificNotificationDto,
  ): Promise<NotificationDocument> {
    try {
      const { userIds, title, message } = createSpecificNotificationDto;

      const userObjectIds = userIds.map((id) => new Types.ObjectId(id));

      const notificationDoc = new NotificationBuilder()
        .setTitle(title)
        .setMessage(message)
        .setCategory(NotificationCategory.APPLICATION)
        .setSpecificUserAudience(userObjectIds)
        .build();

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit to each active user via gateway
      this.notificationGateway.emitMultipleUserSpecificNotifications(
        userIds,
        this.sanitizeNotification(savedNotification),
      );

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Creates a global notification for all users in a campus.
   *
   * @param createCampusGlobalNotificationDto - DTO containing title, message, and campusId
   * @returns The created notification document
   */
  async createGlobalCampusNotification(
    createCampusGlobalNotificationDto: CreateCampusGlobalNotificationDto,
  ): Promise<NotificationDocument> {
    try {
      const notificationDoc = new NotificationBuilder()
        .setTitle(createCampusGlobalNotificationDto.title)
        .setMessage(createCampusGlobalNotificationDto.message)
        .setCategory(NotificationCategory.APPLICATION)
        .setGlobalCampusAudience()
        .build();

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit to all campus admins via gateway
      this.notificationGateway.emitCampusGlobalNotification(
        this.sanitizeNotification(savedNotification),
      );

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Creates a notification for specific campuses.
   *
   * @param createCampusSpecificNotificationDto - DTO containing title, message, and campusId
   * @returns The created notification document
   */
  async createSpecificCampusesNotification(
    createCampusSpecificNotificationDto: CreateCampusSpecificNotificationsDto,
  ): Promise<NotificationDocument> {
    try {
      const { campusIds, ...notificationPayload } =
        createCampusSpecificNotificationDto;

      const campusObjectIds = campusIds.map((id) => new Types.ObjectId(id));

      const notificationDoc = new NotificationBuilder()
        .setTitle(notificationPayload.title)
        .setMessage(notificationPayload.message)
        .setCategory(NotificationCategory.APPLICATION)
        .setSpecificCampusAudience(campusObjectIds)
        .build();

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit to specific campuses via gateway
      this.notificationGateway.emitMultipleCampusSpecificNotification(
        campusIds,
        this.sanitizeNotification(savedNotification),
      );

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Marks multiple notifications as read for a specific user.
   *
   * This method uses a unique compound index on (notificationId, userId) in the NotificationReadReceipt collection
   * to ensure that each user can only have one read receipt per notification. This prevents duplicate entries.
   *
   * The method uses bulkWrite with updateOne and upsert: true for each notificationId. This means:
   *   - If a read receipt for (notificationId, userId) already exists, MongoDB does nothing (no error, no new document).
   *   - If it does not exist, MongoDB creates a new read receipt with the current timestamp.
   *
   * This is safe for cases where the client may select a mix of read and unread notifications:
   *   - Already-read notifications are ignored (no error, no duplicate).
   *   - Unread notifications get a new read receipt.
   *
   * @param userId - The ID of the user marking notifications as read
   * @param notificationIds - The list of notification document IDs to mark as read
   * @returns The number of notifications for which an upsert was attempted (not necessarily the number of new receipts created)
   */
  async markBulkNotificationsAsRead(
    userId: string,
    notificationIds: string[],
  ): Promise<number> {
    // Only allow marking as read if the user is a valid recipient or it's global
    const validIds = await this.getAssociatedNotificationIdsForUser(
      userId,
      notificationIds,
    );
    if (validIds.length === 0) {
      throw new ForbiddenException('No valid notifications to mark as read.');
    }

    const userObjectId = new Types.ObjectId(userId);
    const notificationObjectIds = validIds.map((id) => new Types.ObjectId(id));
    const readTime = new Date();

    // Prepare bulkWrite operations: one upsert per notificationId
    // $setOnInsert ensures readAt is only set if a new document is created
    // upsert: true means if the document exists, do nothing; if not, insert
    const operations = notificationObjectIds.map((notificationId) => ({
      updateOne: {
        filter: { notificationId, userId: userObjectId },
        update: { $setOnInsert: { readAt: readTime } },
        upsert: true,
      },
    }));

    // Execute all upserts in a single bulkWrite operation
    // Thanks to the unique index, no duplicates will be created
    // No errors will be thrown for already existing read receipts
    if (operations.length > 0) {
      await this.notificationReadReceiptModel.bulkWrite(operations);
    }
    // Return the number of upsert attempts (not the number of new receipts)
    return operations.length;
  }

  /**
   * Marks ALL unread notifications as read for a specific user.
   * Allows filtering by category before marking.
   *
   * @param user - The authenticated user object
   * @param category - Optional categories to filter the notifications marked as read
   * @returns The number of notifications marked as read
   */
  async markAllNotificationsAsRead(
    user: AuthenticatedRequest['user'],
    category?: NotificationCategory[],
  ): Promise<number> {
    const queryDto = {
      read_status: NotificationQuery.ReadStatus.UNREAD,
      scope: NotificationQuery.Scope.ALL,
      category,
    } as QueryNotificationDto;

    const baseStages = this.buildNotificationsAggregationStages(user, queryDto);

    // Get _id of all matched unread notifications
    const unreadNotifications = await this.notificationModel.aggregate([
      ...baseStages,
      { $project: { _id: 1 } },
    ]);

    const notificationIds = unreadNotifications.map((n) => n._id.toString());

    if (notificationIds.length === 0) {
      return 0; // nothing to mark
    }

    // Reuse bulk mark function
    return this.markBulkNotificationsAsRead(user._id.toString(), notificationIds);
  }

  /**
   * Marks a single notification as read for a specific user.
   *
   * Uses updateOne with upsert: true and $setOnInsert to ensure that:
   *   - If a read receipt for (notificationId, userId) exists, do nothing (no error, no duplicate).
   *   - If it does not exist, create a new read receipt with the current timestamp.
   *
   * This is safe and idempotent, and works seamlessly with the unique index.
   *
   * @param userId - The ID of the user marking the notification as read
   * @param notificationId - The notification document ID to mark as read
   * @returns True (operation always succeeds or is a no-op)
   */
  async markNotificationAsRead(
    userId: string,
    notificationId: string,
  ): Promise<boolean> {
    // Only allow marking as read if the user is a valid recipient or it's global
    const validIds = await this.getAssociatedNotificationIdsForUser(userId, [
      notificationId,
    ]);
    if (validIds.length === 0) {
      throw new ForbiddenException(
        'You are not allowed to mark this notification as read.',
      );
    }

    const userObjectId = new Types.ObjectId(userId);
    const notificationObjectId = new Types.ObjectId(notificationId);
    const readTime = new Date();

    // Upsert the read receipt: create if not exists, do nothing if exists
    await this.notificationReadReceiptModel.updateOne(
      { notificationId: notificationObjectId, userId: userObjectId },
      { $setOnInsert: { readAt: readTime } },
      { upsert: true },
    );
    // Always return true (operation is safe and idempotent)
    return true;
  }

  /**
   * Constructs a MongoDB query to fetch notifications for a specific recipient (user or campus),
   * based on the audience type and the desired notification scope.
   * Think of it like "Get GLOBAL/SPECIFIC/ALL notifications for a USER/CAMPUS"
   *
   * This method is used to build the base query for fetching notifications that are:
   *   - Global (sent to all users or all campuses)
   *   - Specific (sent to a particular user or campus)
   *   - Both (all notifications relevant to the recipient)
   *
   * @param recipientObjectId - The ObjectId of the recipient (user or campus)
   * @param scope - The scope of notifications to fetch (GLOBAL, SPECIFIC, or ALL)
   * @param audienceType - The type of audience (User or Campus)
   * @returns A MongoDB query object to match notifications for the given recipient and scope
   *
   * Example usage:
   *   - To fetch "global+specific" notifications for a user: getSharedNotificationsQuery(userObjectId, 'ALL', AudienceType.User)
   *   - To fetch only "global" notifications for a campus: getSharedNotificationsQuery(campusObjectId, 'GLOBAL', AudienceType.Campus)
   *   - To fetch only "specific" notifications for a campus: getSharedNotificationsQuery(campusObjectId, 'SPECIFIC', AudienceType.Campus)
   */
  private getSharedNotificationsQuery(
    recipientObjectId: Types.ObjectId,
    scope: QueryNotificationDto['scope'],
    audienceType: AudienceType,
  ): RootFilterQuery<NotificationDocument> {
    // Global notifications only
    if (scope === NotificationQuery.Scope.GLOBAL) {
      return {
        'audience.audienceType': audienceType,
        'audience.isGlobal': true,
      };
    }

    // Specific notifications only
    if (scope === NotificationQuery.Scope.SPECIFIC) {
      return {
        'audience.audienceType': audienceType,
        'audience.isGlobal': false,
        // recipientId should be checked within the array of recipients in the notification document
        'audience.recipients': { $in: [recipientObjectId] },
      };
    }

    // All notifications (global + specific)
    return {
      'audience.audienceType': audienceType,
      $or: [
        { 'audience.isGlobal': true },
        {
          'audience.isGlobal': false,
          'audience.recipients': { $in: [recipientObjectId] },
        },
      ],
    };
  }

  /**
   * Build aggregation stages for fetching notifications with read-state parity
   * to the list endpoint. This excludes pagination and sorting so it can be
   * reused by both list and count flows.
   */
  private buildNotificationsAggregationStages(
    user: AuthenticatedRequest['user'],
    queryDto: QueryNotificationDto,
  ): PipelineStage[] {
    const {
      read_status,
      scope,
      get_campus_notifications,
      category,
    } = queryDto;
    const userCreatedAt = user.created_at;
    const userId = user._id.toString();
    const userObjectId = new Types.ObjectId(userId);

    const matchConditions: RootFilterQuery<NotificationDocument>[] = [];

    const userMatch = this.getSharedNotificationsQuery(
      userObjectId,
      scope,
      AudienceType.User,
    );
    matchConditions.push(userMatch);

    if (get_campus_notifications) {
      const isCampusAdmin =
        user.user_type === UserNS.UserType.Campus_Admin && user.campus_id;
      const campusObjectId = new Types.ObjectId(user.campus_id);
      if (!isCampusAdmin || !campusObjectId) {
        throw new ForbiddenException(
          'Cannot fetch campus notifications. (User is not a valid campus admin)',
        );
      }
      const campusMatch = this.getSharedNotificationsQuery(
        campusObjectId,
        scope,
        AudienceType.Campus,
      );
      matchConditions.push(campusMatch);
    }

    const effectiveCreatedAt = queryDto.created_at
      ? new Date(queryDto.created_at)
      : new Date(userCreatedAt);
      
    // Combine extra filters 
    const extraFilters: RootFilterQuery<NotificationDocument> = { 
      createdAt: { $gte: effectiveCreatedAt } 
    };
    if (category) {
      extraFilters.category = { $in: Array.isArray(category) ? category : [category] };
    }

    const stages: PipelineStage[] = [
      {
        $match:
          matchConditions.length > 1
            ? { $and: [{ $or: matchConditions }, extraFilters] }
            : { ...matchConditions[0], ...extraFilters },
      },
      {
        $addFields: {
          notificationType: '$audience.audienceType',
        },
      },
      {
        $lookup: {
          from: DB_COLLECTIONS.NOTIFICATION_READ_RECEIPTS,
          let: { notificationId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$notificationId', '$$notificationId'] },
                    { $eq: ['$userId', userObjectId] },
                  ],
                },
              },
            },
          ],
          as: 'readReceipts',
        },
      },
      {
        $addFields: {
          isRead: { $gt: [{ $size: '$readReceipts' }, 0] },
        },
      },
      {
        $project: {
          readReceipts: 0,
          'audience.recipients': 0,
        },
      },
    ];

    if (read_status === NotificationQuery.ReadStatus.READ) {
      stages.push({ $match: { isRead: true } });
    } else if (read_status === NotificationQuery.ReadStatus.UNREAD) {
      stages.push({ $match: { isRead: false } });
    }

    return stages;
  }

  /**
   * Returns count of notifications matching the same filters as the list API.
   */
  async getNotificationsCount(
    user: AuthenticatedRequest['user'],
    queryDto: QueryNotificationDto,
  ): Promise<number> {
    const baseStages = this.buildNotificationsAggregationStages(user, queryDto);
    const result = await this.notificationModel.aggregate([
      ...baseStages,
      { $count: 'count' },
    ]);
    return result?.[0]?.count ?? 0;
  }

  /**
   * Get all notifications relevant to a user, including:
   * 1. User-specific notifications
   * 2. Global user notifications
   * 3. Campus-specific notifications (if user is a campus admin AND getCampusNotifications is true)
   * 4. Global campus notifications (if user is a campus admin AND getCampusNotifications is true)
   *
   * This unified approach allows fetching all relevant notifications in a single request.
   * Read status is determined by checking for entries in the notification_read_receipts collection.
   *
   * @param user - The authenticated user object
   * @param queryDto - Query parameters (scope, read_status, pagination, etc.)
   * @returns Array of notifications with isRead status
   */
  async getNotifications(
    user: AuthenticatedRequest['user'],
    queryDto: QueryNotificationDto,
  ) {
    const {
      page,
      limit = 10,
      sortBy,
      sortOrder
    } = queryDto;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'createdAt']: getSortOrder(sortOrder ?? 'desc') } as const;

    const pipeline = this.buildNotificationsAggregationStages(user, queryDto);
    const notificationsWithRead = await this.notificationModel
      .aggregate(pipeline)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    return notificationsWithRead;
  }

  /**
   * Get all notification IDs associated with a user.
   *
   * This method checks if the user is a valid recipient or it's global.
   * If any of the notificationIds does not belong to the user, it will be removed from the list.
   *
   * @param userId - The ID of the user
   * @param notificationIds - The list of notification document IDs to check
   * @returns Array of valid notification IDs
   */
  private async getAssociatedNotificationIdsForUser(
    userId: string,
    notificationIds: string[],
  ): Promise<string[]> {
    const userObjectId = new Types.ObjectId(userId);
    const notifications = await this.notificationModel
      .find({
        _id: { $in: notificationIds.map((id) => new Types.ObjectId(id)) },
        $or: [
          { 'audience.isGlobal': true },
          { 'audience.recipients': userObjectId },
        ],
      })
      .select('_id')
      .lean();

    return notifications.map((n) => n._id.toString());
  }
}
