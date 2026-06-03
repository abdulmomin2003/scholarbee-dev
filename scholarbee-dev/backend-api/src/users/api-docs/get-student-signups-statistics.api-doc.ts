import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

export function GetStudentSignupsStatisticsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get student signup statistics',
      description: 'Returns total, this month, and this week student signup counts. Requires Super Admin privileges.',
    }),
    ApiResponse({
      status: 200,
      description: 'Student signup statistics',
      schema: {
        example: {
          total: 1250,
          thisMonth: 45,
          thisWeek: 12,
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Authentication required' }),
    ApiForbiddenResponse({ description: 'Super Admin privileges required' }),
  );
}

