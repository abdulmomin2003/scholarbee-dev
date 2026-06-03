import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GetCampusStatisticsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Campus applications statistics' }),
    ApiParam({ name: 'campusId', required: true, type: String }),
    ApiQuery({ name: 'campusId', required: false, type: String, description: 'Optional duplicate param in query DTO' }),
    ApiQuery({ name: 'year', required: false, type: String, example: '2025' }),
    ApiResponse({ status: 200, description: 'Campus statistics', schema: { example: { campusId: '651234abcd5678ef9012cde2', total: 50 } } }),
  );
}


