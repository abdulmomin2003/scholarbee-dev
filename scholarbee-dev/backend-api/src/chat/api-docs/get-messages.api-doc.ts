import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GetMessagesByConversationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get messages by conversation' }),
    ApiParam({ name: 'conversationId', required: true, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
    ApiResponse({ status: 200, description: 'Paginated messages', schema: { example: { data: [{ _id: '6512msg...', content: 'Hello' }], meta: { total: 1, page: 1, limit: 20, pages: 1 } } } }),
  );
}


