import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindOneLegalDocumentApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get legal document by ID' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Legal document', schema: { example: { _id: '6512ld01', title: 'Privacy Policy', document_type: 'privacy_policy', status: 'active' } } }),
  );
}


