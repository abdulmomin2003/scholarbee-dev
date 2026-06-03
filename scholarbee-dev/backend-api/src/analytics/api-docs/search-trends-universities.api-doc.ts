import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function SearchTrendsUniversitiesApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Most searched universities' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'time_range', required: false, type: String, enum: ['weekly', 'monthly'] }),
    ApiResponse({ status: 200, description: 'Top universities', schema: { example: [{ name: 'MIT', count: 54 }] } }),
  );
}


