import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetRegionsStatisticsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Regions statistics' }),
    ApiResponse({ status: 200, description: 'Aggregated statistics', schema: { example: { total: 50, countries: ['Pakistan', 'India'], totalCities: 120 } } }),
  );
}

