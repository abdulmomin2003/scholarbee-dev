import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

export function IndexDocumentApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Index a document', description: 'Create or replace a document in the specified index.' }),
    ApiParam({ name: 'index', required: true, type: String }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      description: 'Arbitrary JSON document to index',
      schema: { example: { title: 'Document title', content: 'Document content', tags: ['news'] } },
    }),
    ApiResponse({ status: 200, description: 'Indexing result', schema: { example: { success: true } } }),
  );
}


