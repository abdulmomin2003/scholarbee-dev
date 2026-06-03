import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

export function UpdateDocumentApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a document (partial)' }),
    ApiParam({ name: 'index', required: true, type: String }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ description: 'Partial document (doc payload)', schema: { example: { title: 'Updated title' } } }),
    ApiResponse({ status: 200, description: 'Update result', schema: { example: { success: true } } }),
  );
}


