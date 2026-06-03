import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindOneBlogPostApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get blog post by ID' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Blog post document', schema: { example: { _id: '651234abcd5678ef9012beef', title: 'How to Win Scholarships in 2025' } } }),
  );
}


