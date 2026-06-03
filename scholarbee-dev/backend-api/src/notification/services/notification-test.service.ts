import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationGateway } from 'src/notification/notification.gateway';
import {
  NotificationReadReceipt,
  NotificationReadReceiptDocument,
} from '../schemas/notification-read-receipt.schema';
import {
  NavigationTypeEnum,
  Notification,
  NotificationCategory,
  NotificationDocument,
} from '../schemas/notification.schema';
import { NotificationBuilder } from '../utils/notification.builder';
import { NotificationService } from './notfication.service';

@Injectable()
export class NotificationTestService extends NotificationService {
  constructor(
    @InjectModel(Notification.name)
    notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationReadReceipt.name)
    notificationReadReceiptModel: Model<NotificationReadReceiptDocument>,
    notificationGateway: NotificationGateway,
  ) {
    super(notificationModel, notificationReadReceiptModel, notificationGateway);
  }

  /**
   * Creates a notification for a specific admission program
   * @param programId - The admission program ID
   * @param title - Notification title
   * @param message - Notification message
   * @param userIds - Optional specific user IDs (if not provided, sends to all users)
   * @returns The created notification document
   */
  async createAdmissionProgramNotification(
    programId: string,
    title: string,
    message: string,
    userIds?: string[],
  ): Promise<NotificationDocument> {
    try {
      const programObjectId = new Types.ObjectId(programId);

      let notificationDoc;
      if (userIds && userIds.length > 0) {
        const userObjectIds = userIds.map((id) => new Types.ObjectId(id));
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.ADMISSION_PROGRAM)
          .setSpecificUserAudience(userObjectIds)
          .setNavigation(
            NavigationTypeEnum.ADMISSION_PROGRAM,
            programObjectId,
            {
              type: 'admission_program',
            },
          )
          .build();
      } else {
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.ADMISSION_PROGRAM)
          .setGlobalUserAudience()
          .setNavigation(
            NavigationTypeEnum.ADMISSION_PROGRAM,
            programObjectId,
            {
              type: 'admission_program',
            },
          )
          .build();
      }

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit via gateway
      if (userIds && userIds.length > 0) {
        this.notificationGateway.emitMultipleUserSpecificNotifications(
          userIds,
          this.sanitizeNotification(savedNotification),
        );
      } else {
        this.notificationGateway.emitUserGlobalNotification(
          this.sanitizeNotification(savedNotification),
        );
      }

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Creates a notification for a specific scholarship
   * @param scholarshipId - The scholarship ID
   * @param title - Notification title
   * @param message - Notification message
   * @param campusIds - Optional specific campus IDs (if not provided, sends to all campuses)
   * @returns The created notification document
   */
  async createScholarshipNotification(
    scholarshipId: string,
    title: string,
    message: string,
    campusIds?: string[],
  ): Promise<NotificationDocument> {
    try {
      const scholarshipObjectId = new Types.ObjectId(scholarshipId);

      let notificationDoc: Notification;

      if (campusIds && campusIds.length > 0) {
        const campusObjectIds = campusIds.map((id) => new Types.ObjectId(id));
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.SCHOLARSHIP)
          .setSpecificCampusAudience(campusObjectIds)
          .setNavigation(NavigationTypeEnum.SCHOLARSHIP, scholarshipObjectId, {
            type: 'scholarship',
          })
          .build();
      } else {
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.SCHOLARSHIP)
          .setGlobalCampusAudience()
          .setNavigation(NavigationTypeEnum.SCHOLARSHIP, scholarshipObjectId, {
            type: 'scholarship',
          })
          .build();
      }

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit via gateway
      if (campusIds && campusIds.length > 0) {
        this.notificationGateway.emitMultipleCampusSpecificNotification(
          campusIds,
          this.sanitizeNotification(savedNotification),
        );
      } else {
        this.notificationGateway.emitCampusGlobalNotification(
          this.sanitizeNotification(savedNotification),
        );
      }

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Creates a notification for a specific application status update
   * @param applicationId - The application ID
   * @param title - Notification title
   * @param message - Notification message
   * @param userId - The user ID who should receive this notification
   * @param status - The application status
   * @returns The created notification document
   */
  async createApplicationStatusNotification(
    applicationId: string,
    title: string,
    message: string,
    userId: string,
    status: string,
  ): Promise<NotificationDocument> {
    try {
      const applicationObjectId = new Types.ObjectId(applicationId);
      const userObjectId = new Types.ObjectId(userId);

      const notificationDoc = new NotificationBuilder()
        .setTitle(title)
        .setMessage(message)
        .setCategory(NotificationCategory.APPLICATION_STATUS)
        .setSpecificUserAudience([userObjectId])
        .setNavigation(
          NavigationTypeEnum.APPLICATION_STATUS,
          applicationObjectId,
          { status },
        )
        .build();

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit to the specific user
      this.notificationGateway.emitMultipleUserSpecificNotifications(
        [userId],
        this.sanitizeNotification(savedNotification),
      );

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Creates a notification for a specific campus
   * @param campusId - The campus ID
   * @param title - Notification title
   * @param message - Notification message
   * @param campusIds - Optional specific campus IDs (if not provided, sends to all campuses)
   * @returns The created notification document
   */
  async createCampusNotification(
    campusId: string,
    title: string,
    message: string,
    campusIds?: string[],
  ): Promise<NotificationDocument> {
    try {
      const campusObjectId = new Types.ObjectId(campusId);

      let notificationDoc;
      if (campusIds && campusIds.length > 0) {
        const campusObjectIds = campusIds.map((id) => new Types.ObjectId(id));
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.CAMPUS)
          .setSpecificCampusAudience(campusObjectIds)
          .setNavigation(NavigationTypeEnum.CAMPUS, campusObjectId, {
            type: 'campus',
          })
          .build();
      } else {
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.CAMPUS)
          .setGlobalCampusAudience()
          .setNavigation(NavigationTypeEnum.CAMPUS, campusObjectId, {
            type: 'campus',
          })
          .build();
      }

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit via gateway
      if (campusIds && campusIds.length > 0) {
        this.notificationGateway.emitMultipleCampusSpecificNotification(
          campusIds,
          this.sanitizeNotification(savedNotification),
        );
      } else {
        this.notificationGateway.emitCampusGlobalNotification(
          this.sanitizeNotification(savedNotification),
        );
      }

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Creates a notification for a specific program
   * @param programId - The program ID
   * @param title - Notification title
   * @param message - Notification message
   * @param campusIds - Optional specific campus IDs (if not provided, sends to all campuses)
   * @returns The created notification document
   */
  async createProgramNotification(
    programId: string,
    title: string,
    message: string,
    campusIds?: string[],
  ): Promise<NotificationDocument> {
    try {
      const programObjectId = new Types.ObjectId(programId);

      let notificationDoc;
      if (campusIds && campusIds.length > 0) {
        const campusObjectIds = campusIds.map((id) => new Types.ObjectId(id));
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.PROGRAM)
          .setSpecificCampusAudience(campusObjectIds)
          .setNavigation(NavigationTypeEnum.PROGRAM, programObjectId, {
            type: 'program',
          })
          .build();
      } else {
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.PROGRAM)
          .setGlobalCampusAudience()
          .setNavigation(NavigationTypeEnum.PROGRAM, programObjectId, {
            type: 'program',
          })
          .build();
      }

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit via gateway
      if (campusIds && campusIds.length > 0) {
        this.notificationGateway.emitMultipleCampusSpecificNotification(
          campusIds,
          this.sanitizeNotification(savedNotification),
        );
      } else {
        this.notificationGateway.emitCampusGlobalNotification(
          this.sanitizeNotification(savedNotification),
        );
      }

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Creates a notification for a chat message
   * @param chatId - The chat ID
   * @param title - Notification title
   * @param message - Notification message
   * @param userId - The user ID who should receive this notification
   * @returns The created notification document
   */
  async createChatNotification(
    chatId: string,
    title: string,
    message: string,
    userId: string,
  ): Promise<NotificationDocument> {
    try {
      const chatObjectId = new Types.ObjectId(chatId);
      const userObjectId = new Types.ObjectId(userId);

      const notificationDoc = new NotificationBuilder()
        .setTitle(title)
        .setMessage(message)
        .setCategory(NotificationCategory.CHAT)
        .setSpecificUserAudience([userObjectId])
        .setNavigation(NavigationTypeEnum.CHAT_CONVERSATION, chatObjectId, {
          type: 'chat',
        })
        .build();

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit to the specific user
      this.notificationGateway.emitMultipleUserSpecificNotifications(
        [userId],
        this.sanitizeNotification(savedNotification),
      );

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Creates a notification for a blog post
   * @param blogPostId - The blog post ID
   * @param title - Notification title
   * @param message - Notification message
   * @param userIds - Optional specific user IDs (if not provided, sends to all users)
   * @returns The created notification document
   */
  async createBlogPostNotification(
    blogPostId: string,
    title: string,
    message: string,
    userIds?: string[],
  ): Promise<NotificationDocument> {
    try {
      const blogPostObjectId = new Types.ObjectId(blogPostId);

      let notificationDoc;
      if (userIds && userIds.length > 0) {
        const userObjectIds = userIds.map((id) => new Types.ObjectId(id));
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.BLOG_POST)
          .setSpecificUserAudience(userObjectIds)
          .setNavigation(NavigationTypeEnum.BLOG_POST, blogPostObjectId, {
            type: 'blog_post',
          })
          .build();
      } else {
        notificationDoc = new NotificationBuilder()
          .setTitle(title)
          .setMessage(message)
          .setCategory(NotificationCategory.BLOG_POST)
          .setGlobalUserAudience()
          .setNavigation(NavigationTypeEnum.BLOG_POST, blogPostObjectId, {
            type: 'blog_post',
          })
          .build();
      }

      const notification = new this.notificationModel(notificationDoc);
      const savedNotification = await notification.save();

      // Emit via gateway
      if (userIds && userIds.length > 0) {
        this.notificationGateway.emitMultipleUserSpecificNotifications(
          userIds,
          this.sanitizeNotification(savedNotification),
        );
      } else {
        this.notificationGateway.emitUserGlobalNotification(
          this.sanitizeNotification(savedNotification),
        );
      }

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
