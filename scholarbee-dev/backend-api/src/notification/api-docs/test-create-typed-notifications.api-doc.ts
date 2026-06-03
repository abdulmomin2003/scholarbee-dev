import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateAdmissionProgramNotificationDto,
  CreateScholarshipNotificationDto,
  CreateApplicationStatusNotificationDto,
  CreateCampusNotificationDto,
  CreateProgramNotificationDto,
  CreateChatNotificationDto,
  CreateBlogPostNotificationDto,
} from '../dto/create-notification.dto';

export function CreateAdmissionProgramNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create admission program notification (test)' }),
    ApiBody({
      type: CreateAdmissionProgramNotificationDto,
      examples: {
        default: {
          value: {
            programId: '651234abcd5678ef9012p001',
            title: 'New Admission Program',
            message: 'A new admission program is now open.',
            userIds: ['651234abcd5678ef9012u001']
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created' }),
  );
}

export function CreateScholarshipNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create scholarship notification (test)' }),
    ApiBody({
      type: CreateScholarshipNotificationDto,
      examples: {
        default: {
          value: {
            scholarshipId: '651234abcd5678ef9012s001',
            title: 'New Scholarship',
            message: 'A new scholarship opportunity is available.',
            campusIds: ['651234abcd5678ef9012c001']
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created' }),
  );
}

export function CreateApplicationStatusNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create application status notification (test)' }),
    ApiBody({
      type: CreateApplicationStatusNotificationDto,
      examples: {
        default: {
          value: {
            applicationId: '651234abcd5678ef9012a001',
            title: 'Application Update',
            message: 'Your application status has been updated.',
            userId: '651234abcd5678ef9012u001',
            status: 'approved'
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created' }),
  );
}

export function CreateCampusNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create campus notification (test)' }),
    ApiBody({
      type: CreateCampusNotificationDto,
      examples: {
        default: {
          value: {
            campusId: '651234abcd5678ef9012c001',
            title: 'Campus News',
            message: 'Important update from your campus.',
            campusIds: ['651234abcd5678ef9012c001']
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created' }),
  );
}

export function CreateProgramNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create program notification (test)' }),
    ApiBody({
      type: CreateProgramNotificationDto,
      examples: {
        default: {
          value: {
            programId: '651234abcd5678ef9012p001',
            title: 'Program Update',
            message: 'Updates to your enrolled program.',
            campusIds: ['651234abcd5678ef9012c001']
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created' }),
  );
}

export function CreateChatNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create chat notification (test)' }),
    ApiBody({
      type: CreateChatNotificationDto,
      examples: {
        default: {
          value: {
            chatId: '651234abcd5678ef9012chat01',
            title: 'New Message',
            message: 'You have a new message.',
            userId: '651234abcd5678ef9012u001'
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created' }),
  );
}

export function CreateBlogPostNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create blog post notification (test)' }),
    ApiBody({
      type: CreateBlogPostNotificationDto,
      examples: {
        default: {
          value: {
            blogPostId: '651234abcd5678ef9012bp01',
            title: 'New Blog Post',
            message: 'A new blog post has been published.',
            userIds: ['651234abcd5678ef9012u001']
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created' }),
  );
}

