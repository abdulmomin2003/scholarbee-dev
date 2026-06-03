import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetApplicationStatisticsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Applications statistics' }),
    ApiResponse({ status: 200, description: 'Aggregated statistics', schema: { example: { total: 120, draft: 60, submitted: 40, approved: 20 } } }),
  );
}


