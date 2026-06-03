import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function GetScholarshipByIdApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Get scholarship by ID', description: 'Return scholarship details. Authenticated users can fetch.' }),
        ApiParam({ name: 'scholarshipId', required: true, description: 'Scholarship ID' }),
        ApiResponse({ status: 200, description: 'Scholarship object', schema: { example: { _id: '617f1f77bcf86cd799439099', scholarship_name: 'Merit Scholarship 2025', scholarship_description: 'Full tuition', amount: 1000, university_id: '507f1f77bcf86cd799439011', is_already_applied: false } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
