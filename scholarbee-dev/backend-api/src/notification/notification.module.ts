import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import {
  NotificationController,
  NotificationTestController,
} from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { NotificationService } from './services/notfication.service';
import { NotificationTestService } from './services/notification-test.service';
import { ApplicationNotificationService } from './services/application-notification.service';
import { AdmissionProgramNotificationService } from './services/admission-program-notification.service';
import { StudentScholarshipNotificationService } from './services/student-scholarship-notification.service';
import { ScholarshipNotificationService } from './services/scholarship-notification.service';
import {
  NotificationReadReceipt,
  NotificationReadReceiptSchema,
} from './schemas/notification-read-receipt.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { EmailTemplatesModule } from 'src/email-templates/email-templates.module';
import { Admission, AdmissionSchema } from 'src/admissions/schemas/admission.schema';
import { University, UniversitySchema } from 'src/universities/schemas/university.schema';
import { Scholarship, ScholarshipSchema } from 'src/scholarships/schemas/scholarship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: NotificationReadReceipt.name,
        schema: NotificationReadReceiptSchema,
      },
    ]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Admission.name, schema: AdmissionSchema },
      { name: University.name, schema: UniversitySchema },
      { name: Scholarship.name, schema: ScholarshipSchema },
    ]),
    AuthModule,
    EmailTemplatesModule,
  ],
  controllers: [NotificationController, NotificationTestController],
  providers: [
    NotificationGateway,
    NotificationService,
    NotificationTestService,
    ApplicationNotificationService,
    AdmissionProgramNotificationService,
    StudentScholarshipNotificationService,
    ScholarshipNotificationService,
  ],
  exports: [
    NotificationGateway,
    NotificationService,
    ApplicationNotificationService,
    AdmissionProgramNotificationService,
    StudentScholarshipNotificationService,
    ScholarshipNotificationService,
  ],
})
export class NotificationModule {}
