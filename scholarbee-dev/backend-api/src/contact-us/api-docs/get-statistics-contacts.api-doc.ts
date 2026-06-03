import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetContactsStatisticsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Contacts statistics' }),
    ApiResponse({ status: 200, description: 'Aggregated stats', schema: { example: { total: 120, registration: 80, general: 40 } } }),
  );
}


