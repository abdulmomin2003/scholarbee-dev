import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteConversationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete conversation' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deleted conversation', schema: { example: { _id: '6512conv...', deleted: true } } }),
  );
}


