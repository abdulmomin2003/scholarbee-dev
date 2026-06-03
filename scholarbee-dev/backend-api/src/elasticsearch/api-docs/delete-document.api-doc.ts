import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteDocumentApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a document' }),
    ApiParam({ name: 'index', required: true, type: String }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deletion result', schema: { example: { success: true } } }),
  );
}


