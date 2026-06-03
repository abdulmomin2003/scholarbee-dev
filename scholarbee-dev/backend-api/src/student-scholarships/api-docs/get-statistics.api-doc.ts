import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetStudentScholarshipStatisticsApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Student scholarships statistics', description: 'Get aggregated statistics for student scholarships.' }),
        ApiResponse({ status: 200, description: 'Statistics', schema: { example: { totalApplications: 120, pending: 80, approved: 30, rejected: 10 } } }),
    );
}
