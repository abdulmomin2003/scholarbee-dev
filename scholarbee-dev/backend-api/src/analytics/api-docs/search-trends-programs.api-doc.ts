import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function SearchTrendsProgramsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Most searched programs' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'time_range', required: false, type: String, enum: ['weekly', 'monthly'] }),
    ApiResponse({ status: 200, description: 'Top programs', schema: { example: [{ name: 'BSc CS', count: 98 }] } }),
  );
}


