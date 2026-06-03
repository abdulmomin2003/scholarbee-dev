import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function GetDocumentApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a document by ID' }),
    ApiParam({ name: 'index', required: true, type: String }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Document', schema: { example: { _id: '1', _index: 'my-index', _source: { title: 'Document' } } } }),
  );
}


