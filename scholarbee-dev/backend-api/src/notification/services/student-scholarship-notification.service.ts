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
import {
    StudentScholarshipDocument,
    ScholarshipApprovalStatusEnum,
} from 'src/student-scholarships/schemas/student-scholarship.schema';
import { ScholarshipDocument } from 'src/scholarships/schemas/scholarship.schema';
import { BetterOmit } from 'src/utils/typescript.utils';

@Injectable()
export class StudentScholarshipNotificationService extends NotificationService {
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
     * This method is used to send a notification to the student when the scholarship application status is updated by the admin (either to approve or reject).
     * Automatically determines the appropriate notification based on scholarship application status
     * @param studentScholarship The updated student scholarship object
     * @param customTitle Optional custom title (if not provided, will use default based on status)
     * @param customMessage Optional custom message (if not provided, will use default based on status)
     */
    async scholarshipApplicationProgressStatus(
        studentScholarship: StudentScholarshipDocument,
        customTitle?: string,
        customMessage?: string,
    ): Promise<NotificationDocument> {
        try {
            const studentScholarshipObjectId = studentScholarship._id;
            const studentObjectId = studentScholarship.student_id;
            const scholarshipName = studentScholarship.scholarship_id?.['scholarship_name'] || 'your scholarship';
            const imageUrl = studentScholarship.scholarship_id?.['image_url'];

            // Determine notification content based on status
            let title: string;
            let message: string;
            let category: NotificationCategory;

            switch (studentScholarship.approval_status) {
                case ScholarshipApprovalStatusEnum.Approved:
                    title = customTitle || 'Scholarship Application Approved!';
                    message =
                        customMessage ||
                        `Congratulations! Your scholarship application for ${scholarshipName} has been approved.`;
                    category = NotificationCategory.SCHOLARSHIP;
                    break;

                case ScholarshipApprovalStatusEnum.Rejected:
                    title = customTitle || 'Scholarship Application Status Update';
                    message =
                        customMessage ||
                        `Your scholarship application for ${scholarshipName} has been rejected.`;
                    category = NotificationCategory.SCHOLARSHIP;
                    break;

                default:
                    throw new BadRequestException('Invalid scholarship application status');
            }

            // Create notification with multiple navigation contexts
            const notificationDoc = new NotificationBuilder()
                .setTitle(title)
                .setMessage(message)
                .setCategory(category)
                .setSpecificUserAudience([studentObjectId])
                .setNavigation(NavigationTypeEnum.SCHOLARSHIP, studentScholarshipObjectId)
                // Add additional navigation context for scholarship if available
                .setNavigation(NavigationTypeEnum.SCHOLARSHIP, studentScholarship.scholarship_id)
                .setImageUrl(imageUrl)
                .build();

            const savedNotification =
                await this.notificationModel.create(notificationDoc);

            // Emit real-time notification
            this.notificationGateway.emitMultipleUserSpecificNotifications(
                [studentObjectId.toString()],
                this.sanitizeNotification(savedNotification),
            );

            return savedNotification;
        } catch (error) {
            console.error('Error sending scholarship status update notification:', error);
            throw new Error(
                `Failed to create scholarship application status notification: ${error.message}`,
            );
        }
    }

    /**
     * Handle scholarship application submission notification to campus admins
     * @param scholarshipApplication The submitted student scholarship object
     */
    async scholarshipApplicationSubmission(scholarshipApplication: BetterOmit<StudentScholarshipDocument, 'scholarship_id'> & { scholarship_id: ScholarshipDocument }): Promise<NotificationDocument | null> {
        const studentScholarshipId = scholarshipApplication._id;
        const scholarship = scholarshipApplication.scholarship_id;
        const scholarshipName = scholarship.scholarship_name || 'the scholarship';
        const studentName = scholarshipApplication.student_snapshot?.name || 'A student';
        const imageUrl = scholarship.image_url;

        // Get campus IDs from the scholarship
        const campusIds = scholarship.campus_ids || [];

        // If no campus IDs are available, don't create any notification
        if (!campusIds || campusIds.length === 0) {
            console.log('No campus IDs found for scholarship, skipping notification');
            return null;
        }

        const notificationDoc = new NotificationBuilder()
            .setTitle('New Scholarship Application Received')
            .setMessage(
                `${studentName} has submitted a new scholarship application for ${scholarshipName}. Please review the application.`,
            )
            .setCategory(NotificationCategory.SCHOLARSHIP)
            .setSpecificCampusAudience(campusIds)
            .setNavigation(NavigationTypeEnum.SCHOLARSHIP, studentScholarshipId)
            // Add navigation to scholarship for additional context
            .setNavigation(NavigationTypeEnum.SCHOLARSHIP, scholarship._id)
            .setImageUrl(imageUrl)
            .build();

        const savedNotification =
            await this.notificationModel.create(notificationDoc);

        // Emit real-time notification to all relevant campuses
        this.notificationGateway.emitMultipleCampusSpecificNotification(
            campusIds.map(id => id.toString()),
            this.sanitizeNotification(savedNotification),
        );

        return savedNotification;
    }
}
