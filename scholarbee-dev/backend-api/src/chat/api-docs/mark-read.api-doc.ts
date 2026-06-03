import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function MarkConversationAsReadByUserApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Mark conversation as read by user' }),
    ApiParam({ name: 'conversationId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Messages marked as read', schema: { example: { success: true } } }),
  );
}

export function MarkConversationAsReadByCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Mark conversation as read by campus (admin only)' }),
    ApiParam({ name: 'conversationId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Messages marked as read', schema: { example: { success: true } } }),
  );
}


