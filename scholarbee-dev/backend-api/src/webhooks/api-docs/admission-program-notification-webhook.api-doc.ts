import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { AdmissionProgramNotificationWebhookDto } from '../dto/notification-webhook.dto';

export function AdmissionProgramNotificationWebhookApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Admission program creation notification webhook', description: 'Handles webhook notifications when an admission program is created. Requires webhook authentication and rate limiting.' }),
    ApiBody({
      type: AdmissionProgramNotificationWebhookDto,
      examples: {
        default: {
          value: {
            admission_program_id: '651234abcd5678ef9012ap01',
            admission_id: '651234abcd5678ef9012ad01',
            campus_id: '651234abcd5678ef9012c001',
            campus_name: 'Main Campus',
            program_name: 'Bachelor of Computer Science',
            program_id: '651234abcd5678ef9012p001',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Webhook processed successfully', schema: { example: { success: true, message: 'Notification webhook processed' } } }),
    ApiUnauthorizedResponse({ description: 'Invalid webhook authentication' }),
    ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' }),
  );
}

