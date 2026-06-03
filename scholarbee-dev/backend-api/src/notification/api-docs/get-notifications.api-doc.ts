import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GetNotificationsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get notifications', description: 'Retrieve paginated notifications for the authenticated user.' }),
    ApiQuery({ name: 'scope', required: false, type: String, enum: ['global', 'specific', 'all'], example: 'specific' }),
    ApiQuery({ name: 'read_status', required: false, type: String, enum: ['any', 'unread', 'read'], example: 'unread' }),
    ApiQuery({ name: 'get_campus_notifications', required: false, type: Boolean, example: false }),
    ApiQuery({ name: 'category', required: false, type: [String], description: 'Filter by one or more categories (e.g., admission_program, scholarship)' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiResponse({
      status: 200,
      description: 'Paginated notifications',
      schema: {
        example: {
          data: [
            { _id: '6512not01', title: 'New Program', message: 'A new program is available', read: false, category: 'admission_program', image_url: 'https://example.com/logo.png' }
          ],
          meta: { total: 1, page: 1, limit: 10, pages: 1 }
        }
      }
    }),
  );
}

export function GetNotificationsCountApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get notifications count', description: 'Get the count of notifications for the authenticated user.' }),
    ApiQuery({ name: 'scope', required: false, type: String, enum: ['global', 'specific', 'all'] }),
    ApiQuery({ name: 'read_status', required: false, type: String, enum: ['any', 'unread', 'read'] }),
    ApiQuery({ name: 'get_campus_notifications', required: false, type: Boolean }),
    ApiQuery({ name: 'category', required: false, type: [String] }),
    ApiResponse({ status: 200, description: 'Notification count', schema: { example: { count: 5 } } }),
  );
}

