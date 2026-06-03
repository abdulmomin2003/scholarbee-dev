import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MarkBulkNotificationsAsReadDto } from '../dto/create-notification.dto';

export function MarkBulkNotificationsAsReadApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Mark multiple notifications as read' }),
    ApiBody({
      type: MarkBulkNotificationsAsReadDto,
      examples: {
        default: {
          value: {
            notificationIds: ['6512not01', '6512not02', '6512not03']
          }
        }
      }
    }),
    ApiResponse({ status: 200, description: 'Number of notifications marked as read', schema: { example: { updatedCount: 3 } } }),
  );
}

export function MarkNotificationAsReadApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Mark single notification as read' }),
    ApiParam({ name: 'notificationId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Notification marked as read', schema: { example: { updated: true } } }),
  );
}

export function MarkAllNotificationsAsReadApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Mark all notifications as read for the user' }),
    ApiQuery({ name: 'category', required: false, type: [String], description: 'Filter by one or more categories (e.g., admission_program, scholarship)' }),
    ApiResponse({ status: 200, description: 'Number of notifications marked as read', schema: { example: { updatedCount: 5 } } }),
  );
}
