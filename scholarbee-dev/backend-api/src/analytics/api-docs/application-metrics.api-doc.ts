import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApplicationMetricRegisterEventDto } from 'src/applications/dto/application-analytics.dto';

export function ApplicationMetricsUniversitiesApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Popular universities (applications)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'time_range', required: false, type: String, enum: ['weekly', 'monthly'] }),
    ApiResponse({ status: 200, description: 'Popular universities stats', schema: { example: [{ universityId: 'u1', count: 120 }] } }),
  );
}

export function ApplicationMetricsOverallApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Application metrics overview' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'time_range', required: false, type: String, enum: ['weekly', 'monthly'] }),
    ApiResponse({ status: 200, description: 'Overview metrics', schema: { example: { total: 500, completed: 120, in_progress: 380 } } }),
  );
}

export function ApplicationMetricsDailyBreakdownApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Daily application metrics breakdown' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'time_range', required: false, type: String, enum: ['weekly', 'monthly'] }),
    ApiResponse({ status: 200, description: 'Daily breakdown', schema: { example: [{ date: '2025-01-01', count: 15 }] } }),
  );
}

export function ApplicationMetricsRegisterEventApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Register application event' }),
    ApiBody({
      type: ApplicationMetricRegisterEventDto,
      examples: {
        default: {
          value: {
            step: 'application/start',
            campusId: '651234abcd5678ef9012cdea',
            universityId: '651234abcd5678ef9012cdeb',
            programId: '651234abcd5678ef9012cdec',
            admissionProgramId: '651234abcd5678ef9012cded',
            eventType: 'navigate',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Event registered', schema: { example: { success: true } } }),
  );
}


