import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function SearchTrendsMajorsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Most searched majors' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of items to return (default 10)' }),
    ApiQuery({ name: 'time_range', required: false, type: String, enum: ['weekly', 'monthly'], description: 'Optional time range filter' }),
    ApiResponse({ status: 200, description: 'Top majors', schema: { example: [{ name: 'Computer Science', count: 132 }] } }),
  );
}


