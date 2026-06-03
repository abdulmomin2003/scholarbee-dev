import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteIndexApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete an index' }),
    ApiParam({ name: 'index', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deletion result', schema: { example: { success: true } } }),
  );
}


