import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetFeesStatisticsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Fees statistics' }),
    ApiResponse({ status: 200, description: 'Aggregated stats', schema: { example: { total: 120, avgTuition: 120000 } } }),
  );
}


