import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCampusGlobalNotificationDto, CreateCampusSpecificNotificationsDto } from '../dto/create-notification.dto';

export function CreateGlobalCampusNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create global campus notification (test)', description: 'Create a notification for all campuses. Test endpoint.' }),
    ApiBody({
      type: CreateCampusGlobalNotificationDto,
      examples: {
        default: {
          value: {
            title: 'Campus Announcement',
            message: 'Important announcement for all campuses.'
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created', schema: { example: { _id: '6512not01' } } }),
  );
}

export function CreateSpecificCampusesNotificationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create notification for specific campuses (test)', description: 'Create a notification for specific campus IDs. Test endpoint.' }),
    ApiBody({
      type: CreateCampusSpecificNotificationsDto,
      examples: {
        default: {
          value: {
            title: 'Campus Event',
            message: 'A new event is scheduled.',
            campusIds: ['651234abcd5678ef9012c001', '651234abcd5678ef9012c002']
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Notification created', schema: { example: { _id: '6512not01' } } }),
  );
}

