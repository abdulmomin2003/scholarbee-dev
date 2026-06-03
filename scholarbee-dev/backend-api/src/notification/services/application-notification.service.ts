/**
 * TEMPORARY CHANGE NOTICE:
 * This service has been modified to temporarily prevent sending emails to users
 * on application status changes. This is a temporary change that must be reverted after the sprint.
 *
 * To restore email functionality after the sprint:
 * 1. Search for "TEMPORARY EMAIL FILTER" in this file
 * 2. Uncomment the sendApplicationStatusEmail() call in applicationProgressStatus()
 * 3. Remove the early return in sendApplicationStatusEmail() method
 *
 * This affects the following methods:
 * - applicationProgressStatus (email sending is commented out)
 * - sendApplicationStatusEmail (method has early return to prevent execution)
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApplicationDocument,
  ApplicationStatus,
} from 'src/applications/schemas/application.schema';
import { IConfiguration } from 'src/config/configuration';
import { TemplateRendererService } from 'src/email-templates/services/template-renderer.service';
import { EmailTemplateId } from 'src/email-templates/types/template.types';
import { TemplateDataBuilder } from 'src/email-templates/utils/template-data.builder';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { stringToObjectId } from 'src/utils/db.utils';
import { EmailService } from 'src/email/email.service';
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

interface InAppNotificationStatusConfig {
  notificationTitle: string;
  notificationMessage: string;
  category: NotificationCategory;
}

@Injectable()
export class ApplicationNotificationService extends NotificationService {
  private readonly emailNotificationStatusConfig: Partial<
    Record<ApplicationStatus, EmailTemplateId>
  > = {
      [ApplicationStatus.APPROVED]: EmailTemplateId.APPLICATION_STATUS_APPROVED,
      [ApplicationStatus.REJECTED]: EmailTemplateId.APPLICATION_STATUS_REJECTED,
      [ApplicationStatus.UNDER_REVIEW]:
        EmailTemplateId.APPLICATION_STATUS_UNDER_REVIEW,
    };

  // Centralized status configuration
  private readonly inAppNotificationStatusConfig: Partial<
    Record<ApplicationStatus, InAppNotificationStatusConfig>
  > = {
      [ApplicationStatus.APPROVED]: {
        notificationTitle: 'Application Approved!',
        notificationMessage:
          'Congratulations! Your application has been approved. Check your application status for next steps.',
        category: NotificationCategory.APPLICATION_STATUS,
      },
      [ApplicationStatus.REJECTED]: {
        notificationTitle: 'Application Status Update',
        notificationMessage:
          'Your application has been reviewed. Please check your application status for more details.',
        category: NotificationCategory.APPLICATION_STATUS,
      },
      [ApplicationStatus.UNDER_REVIEW]: {
        notificationTitle: 'Application Under Review',
        notificationMessage:
          "Your application is now under review. We'll notify you once the review is complete.",
        category: NotificationCategory.APPLICATION_STATUS,
      },
      [ApplicationStatus.PENDING]: {
        notificationTitle: 'Application Submitted',
        notificationMessage:
          "Your application has been submitted successfully. We'll review it and get back to you soon.",
        category: NotificationCategory.APPLICATION,
      },
    };

  constructor(
    @InjectModel(Notification.name)
    notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationReadReceipt.name)
    notificationReadReceiptModel: Model<NotificationReadReceiptDocument>,
    notificationGateway: NotificationGateway,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private templateRenderer: TemplateRendererService,
    private configService: ConfigService<IConfiguration>,
    private readonly emailService: EmailService,
  ) {
    super(notificationModel, notificationReadReceiptModel, notificationGateway);
  }

  /**
   * This method is used to send a notification to the applicant when the application status is updated by the admin (either to approve or reject or under review). The notification is sent to the applicant only.
   * Automatically determines the appropriate notification based on application status
   * @param application The updated application object
   * @param customTitle Optional custom title (if not provided, will use default based on status)
   * @param customMessage Optional custom message (if not provided, will use default based on status)
   */
  async dispatchSendInAppNotification(
    application: ApplicationDocument,
  ): Promise<NotificationDocument> {
    try {
      const applicationObjectId = application._id;
      const applicantObjectId = stringToObjectId(
        application.applicant.toString(),
      );
      const programName = application.program.toString();

      // Get status configuration
      const config = this.inAppNotificationStatusConfig[application.status];
      if (!config) {
        throw new BadRequestException(
          `Invalid application status: ${application.status}`,
        );
      }

      // Use centralized configuration with custom overrides
      const title = config.notificationTitle;
      const message = config.notificationMessage; /* .replace(
        'Your application',
        `Your application for ${programName}`,
      ) */
      const category = config.category;

      // Create notification with multiple navigation contexts
      const notificationDoc = new NotificationBuilder()
        .setTitle(title)
        .setMessage(message)
        .setCategory(category)
        .setSpecificUserAudience([applicantObjectId])
        .setNavigation(NavigationTypeEnum.APPLICATION, applicationObjectId)
        // Add additional navigation context for program if available
        .setNavigation(NavigationTypeEnum.PROGRAM, application.program)
        .build();

      const savedNotification =
        await this.notificationModel.create(notificationDoc);

      // Emit real-time notification
      this.notificationGateway.emitMultipleUserSpecificNotifications(
        [applicantObjectId.toString()],
        this.sanitizeNotification(savedNotification),
      );

      return savedNotification;
    } catch (error) {
      console.error('Error sending status update notification:', error);
      throw new Error(
        `Failed to create application status notification: ${error.message}`,
      );
    }
  }

  /**
   * Create template-specific data based on application status
   */
  private createTemplateData(
    application: ApplicationDocument,
    user: any,
    applicationDetails: {
      programName: string;
      institute: string;
      educationLevel: string;
    },
  ): any {
    const frontendUrl = this.configService.get('frontend.url', {
      infer: true,
    });
    const commonData = {
      applicantName: `${user.first_name} ${user.last_name}`,
      userEmail: user.email,
      programName: applicationDetails.programName,
      institute: applicationDetails.institute,
      applicationId: application._id.toString(),
      // dashboardUrl: `${frontendUrl}/dashboard/applications/${application._id}`,
      dashboardUrl: `${frontendUrl}`,
    };

    switch (application.status) {
      case ApplicationStatus.APPROVED:
        return TemplateDataBuilder.createApprovedData({
          ...commonData,
          educationLevel: applicationDetails.educationLevel,
        });

      case ApplicationStatus.REJECTED:
        return TemplateDataBuilder.createRejectedData({
          ...commonData,
          // rejectionReason:
          //   "The applicant's academic record did not meet the minimum required GPA for this highly competitive program.",
        });

      case ApplicationStatus.UNDER_REVIEW:
        return TemplateDataBuilder.createUnderReviewData({
          ...commonData,
          reviewTimeline: '2-4 weeks',
        });

      default:
        throw new Error(
          `No template data builder for status: ${application.status}`,
        );
    }
  }

  /**
   * Sends email notification for application status changes using templates
   * @param application The application object
   * @param applicationDetails Pre-fetched application details
   * @param customTitle Optional custom title (overrides template subject)
   * @param customMessage Optional custom message (not used with templates)
   */
  async sendApplicationStatusEmail(
    application: ApplicationDocument,
    applicationDetails: {
      programName: string;
      institute: string;
      educationLevel: string;
    },
  ): Promise<void> {
    try {
      // Get the applicant user details
      const user = await this.userModel.findById(application.applicant).lean();
      if (!user) {
        console.error(`User not found for application ${application._id}`);
        return;
      }

      // Get status configuration
      const templateId = this.emailNotificationStatusConfig[application.status];
      if (!templateId) {
        console.warn(`No template available for status: ${application.status}`);
        return;
      }

      // Create template-specific data and render email
      const templateData = this.createTemplateData(
        application,
        user,
        applicationDetails,
      );

      // Render email using centralized template ID
      const renderedEmail = await this.templateRenderer.renderTemplate(
        templateId, // Type assertion needed due to template ID mapping
        templateData,
      );

      // Send email using template
      await this.emailService.send({
        to: user.email,
        subject: renderedEmail.subject,
        html: renderedEmail.html,
      });

      console.log(
        `Sent application status email to ${user.email} for application ${application._id} with status ${application.status} using template ${templateId}`,
      );
    } catch (error) {
      console.error('Error sending application status email:', error);
      // throw new Error(
      //   `Failed to send application status email: ${error.message}`,
      // );
      // Don't throw error to prevent breaking the main notification flow
    }
  }

  /**
   * Handle application submission notification to campus admins
   * @param application The submitted application object
   */
  async applicationSubmission(
    application: ApplicationDocument,
  ): Promise<NotificationDocument | null> {
    const applicationId = application._id.toString();
    const applicationObjectId = stringToObjectId(applicationId);
    const campusId = application.campus_id;

    const programName = application.program || 'the program';
    const applicantName = application.applicant_snapshot
      ? `${application.applicant_snapshot.first_name} ${application.applicant_snapshot.last_name}`
      : 'A student';

    // If no campus ID is available, don't create any notification
    if (!campusId) {
      console.log('No campus ID found for application, skipping notification');
      return null;
    }
    const campusObjectId = stringToObjectId(campusId.toString());

    const notificationDoc = new NotificationBuilder()
      .setTitle('New Application Received')
      .setMessage(
        `${applicantName} has submitted a new application for ${programName}. Please review the application.`,
      )
      .setCategory(NotificationCategory.APPLICATION)
      .setSpecificCampusAudience([campusObjectId])
      .setNavigation(NavigationTypeEnum.APPLICATION, applicationObjectId)
      // Add navigation to program and campus for additional context
      .setNavigation(NavigationTypeEnum.PROGRAM, application.program)
      .setNavigation(NavigationTypeEnum.CAMPUS, campusObjectId)
      .build();

    const savedNotification =
      await this.notificationModel.create(notificationDoc);

    // Emit real-time notification to campus admins
    this.notificationGateway.emitMultipleCampusSpecificNotification(
      [campusId.toString()],
      this.sanitizeNotification(savedNotification),
    );

    return savedNotification;
  }

  /**
   * Creates a notification for application deadline reminder
   * @param applicationId - The application ID
   * @param title - Notification title
   * @param message - Notification message
   * @param userId - The user ID who should receive this notification
   * @param deadline - The deadline date
   * @returns The created notification document
   */
  //   async createApplicationDeadlineNotification(
  //     applicationId: string,
  //     title: string,
  //     message: string,
  //     userId: string,
  //     deadline: Date,
  //   ): Promise<NotificationDocument> {
  //     try {
  //       const applicationObjectId = new Types.ObjectId(applicationId);
  //       const userObjectId = new Types.ObjectId(userId);

  //       const notificationDoc = new NotificationBuilder()
  //         .setTitle(title)
  //         .setMessage(message)
  //         .setCategory(NotificationCategory.APPLICATION)
  //         .setSpecificUserAudience([userObjectId])
  //         .setNavigation(NavigationTypeEnum.APPLICATION, applicationObjectId, {
  //           type: 'application',
  //           deadline: deadline.toISOString(),
  //         })
  //         .build();

  //       const notification = new this.notificationModel(notificationDoc);
  //       const savedNotification = await notification.save();

  //       // Emit to the specific user
  //       this.notificationGateway.emitMultipleUserSpecificNotifications(
  //         [userId],
  //         this.sanitizeNotification(savedNotification),
  //       );

  //       return savedNotification;
  //     } catch (error) {
  //       throw new Error(
  //         `Failed to create application deadline notification: ${error.message}`,
  //       );
  //     }
  //   }
}
