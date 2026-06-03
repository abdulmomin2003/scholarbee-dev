import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindOneCampusBySlugApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get campus by slug' }),
    ApiParam({ name: 'slug', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Campus document' }),
    ApiResponse({ status: 404, description: 'Campus not found' }),
  );
}
