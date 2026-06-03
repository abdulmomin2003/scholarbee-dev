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
import { AdmissionProgramNotificationWebhookDto } from 'src/webhooks/dto/notification-webhook.dto';
import { stringToObjectId } from 'src/utils/db.utils';
import { Admission, AdmissionDocument } from 'src/admissions/schemas/admission.schema';
import { University, UniversityDocument } from 'src/universities/schemas/university.schema';

@Injectable()
export class AdmissionProgramNotificationService extends NotificationService {
  constructor(
    @InjectModel(Notification.name)
    notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationReadReceipt.name)
    notificationReadReceiptModel: Model<NotificationReadReceiptDocument>,
    notificationGateway: NotificationGateway,
    @InjectModel(Admission.name)
    private readonly admissionModel: Model<AdmissionDocument>,
    @InjectModel(University.name)
    private readonly universityModel: Model<UniversityDocument>,
  ) {
    super(notificationModel, notificationReadReceiptModel, notificationGateway);
  }

  /**
   * Creates a notification when a new admission program is added
   * @param admissionProgram The admission program data
   * @param audience Optional audience configuration
   * @returns The created notification document
   */
  async admissionProgramCreated(
    admissionProgram: AdmissionProgramNotificationWebhookDto,
  ): Promise<NotificationDocument> {
    // TODO: Get the name from the admission program and get the aggregated/populated data
    try {
      // Fetch admission to get university_id
      const admission = await this.admissionModel
        .findById(admissionProgram.admission_id)
        .select('university_id')
        .exec();

      let logoUrl: string | undefined;

      if (admission && admission.university_id) {
        const university = await this.universityModel
          .findById(admission.university_id)
          .select('logo_url')
          .exec();
        
        if (university && university.logo_url) {
          logoUrl = university.logo_url;
        }
      }

      const notificationDoc = new NotificationBuilder()
        .setTitle('New Admission Program Available')
        .setMessage(
          `A new admission program "${admissionProgram.program_name}" has been added in "${admissionProgram.campus_name}" campus. Check it out!`,
        )
        .setCategory(NotificationCategory.ADMISSION_PROGRAM)
        .setNavigation(
          NavigationTypeEnum.ADMISSION_PROGRAM,
          stringToObjectId(admissionProgram.admission_program_id),
        )
        .setGlobalUserAudience()
        .setImageUrl(logoUrl)
        .build();

      const savedNotification =
        await this.notificationModel.create(notificationDoc);

      // Emit real-time notification to all student users
      this.notificationGateway.emitUserGlobalNotification(
        this.sanitizeNotification(savedNotification),
      );

      return savedNotification;
    } catch (error) {
      console.error('Error creating admission program notification:', error);
      throw new Error(
        `Failed to create admission program notification: ${error.message}`,
      );
    }
  }

  // /**
  //  * Creates a notification when a new scholarship is added
  //  * @param scholarship The scholarship data
  //  * @param audience Optional audience configuration
  //  * @returns The created notification document
  //  */
  // async scholarshipCreated(
  //   scholarship: any,
  //   audience?: {
  //     type: 'global' | 'specific';
  //     recipients?: string[];
  //   },
  // ): Promise<NotificationDocument> {
  //   try {
  //     const notificationDoc = new NotificationBuilder()
  //       .setTitle('New Scholarship Available')
  //       .setMessage(
  //         `A new scholarship "${scholarship.name}" is now available. Apply now!`,
  //       )
  //       .setCategory(NotificationCategory.SCHOLARSHIP)
  //       .setNavigation(
  //         NavigationTypeEnum.SCHOLARSHIP,
  //         new Types.ObjectId(scholarship._id),
  //       )
  //       .build();

  //     // Set audience based on configuration
  //     if (audience?.type === 'specific' && audience.recipients) {
  //       const recipientIds = audience.recipients.map(
  //         (id) => new Types.ObjectId(id),
  //       );
  //       notificationDoc.audience = {
  //         audienceType: AudienceType.Campus,
  //         isGlobal: false,
  //         recipients: recipientIds,
  //       };
  //     } else {
  //       notificationDoc.audience = {
  //         audienceType: AudienceType.Campus,
  //         isGlobal: true,
  //       };
  //     }

  //     const savedNotification =
  //       await this.notificationModel.create(notificationDoc);

  //     // Emit real-time notification based on audience type
  //     if (audience?.type === 'specific' && audience.recipients) {
  //       this.notificationGateway.emitMultipleCampusSpecificNotification(
  //         audience.recipients,
  //         this.sanitizeNotification(savedNotification),
  //       );
  //     } else {
  //       this.notificationGateway.emitCampusGlobalNotification(
  //         this.sanitizeNotification(savedNotification),
  //       );
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error('Error creating scholarship notification:', error);
  //     throw new Error(
  //       `Failed to create scholarship notification: ${error.message}`,
  //     );
  //   }
  // }

  // /**
  //  * Creates a notification when a program is updated
  //  * @param program The updated program data
  //  * @returns The created notification document
  //  */
  // async programUpdated(program: any): Promise<NotificationDocument> {
  //   try {
  //     const notificationDoc = new NotificationBuilder()
  //       .setTitle('Program Information Updated')
  //       .setMessage(
  //         `The program "${program.name}" has been updated with new information.`,
  //       )
  //       .setCategory(NotificationCategory.PROGRAM)
  //       .setNavigation(
  //         NavigationTypeEnum.PROGRAM,
  //         new Types.ObjectId(program._id),
  //       )
  //       .build();

  //     // Program updates are always global for users
  //     notificationDoc.audience = {
  //       audienceType: AudienceType.User,
  //       isGlobal: true,
  //     };

  //     const savedNotification =
  //       await this.notificationModel.create(notificationDoc);

  //     // Emit real-time notification to all users
  //     this.notificationGateway.emitUserGlobalNotification(
  //       this.sanitizeNotification(savedNotification),
  //     );

  //     return savedNotification;
  //   } catch (error) {
  //     console.error('Error creating program update notification:', error);
  //     throw new Error(
  //       `Failed to create program update notification: ${error.message}`,
  //     );
  //   }
  // }
}
