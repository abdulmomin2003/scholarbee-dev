import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetOrganizationsStatisticsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Organizations statistics' }),
    ApiResponse({ status: 200, description: 'Aggregated statistics', schema: { example: { total: 120, government: 40, private: 60, university: 20 } } }),
  );
}

