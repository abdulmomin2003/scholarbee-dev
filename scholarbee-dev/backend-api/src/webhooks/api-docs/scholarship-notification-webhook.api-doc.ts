import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ScholarshipNotificationWebhookDto } from '../dto/notification-webhook.dto';

export function ScholarshipNotificationWebhookApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Scholarship creation notification webhook', description: 'Handles webhook notifications when a scholarship is created. Requires webhook authentication and rate limiting.' }),
    ApiBody({
      type: ScholarshipNotificationWebhookDto,
      examples: {
        default: {
          value: {
            scholarship_id: '651234abcd5678ef9012s001',
            scholarship_name: 'Merit Scholarship 2025',
            scholarship_description: 'Full tuition scholarship for high-achieving students',
            scholarship_type: 'merit',
            location: 'local',
            degree_level: 'Bachelors',
            amount: 150000,
            campus_ids: ['651234abcd5678ef9012c001', '651234abcd5678ef9012c002'],
            university_id: '651234abcd5678ef9012u001',
            organization: {
              id: '651234abcd5678ef9012org1',
              name: 'Education Foundation',
            },
            application_deadline: '2025-03-31T23:59:59.000Z',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Webhook processed successfully', schema: { example: { success: true, message: 'Scholarship notification webhook processed' } } }),
    ApiUnauthorizedResponse({ description: 'Invalid webhook authentication' }),
    ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' }),
  );
}

