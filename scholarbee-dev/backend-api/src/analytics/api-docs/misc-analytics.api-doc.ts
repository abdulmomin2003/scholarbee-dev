import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ExternalProgramApplicationsAnalyticsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'External program applications analytics' }),
    ApiResponse({ status: 200, description: 'External applications stats', schema: { example: { total: 120 } } }),
  );
}

export function ProgramApplicationsAnalyticsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Program applications analytics for current user' }),
    ApiResponse({ status: 200, description: 'Programs analytics', schema: { example: { total: 40 } } }),
  );
}

export function ScholarshipApplicationsAnalyticsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Scholarship applications analytics for current user' }),
    ApiResponse({ status: 200, description: 'Scholarship analytics', schema: { example: { total: 15 } } }),
  );
}


