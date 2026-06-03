import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

export function FindAdmissionsByUniversityApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find admissions by university', description: 'List admissions for a specific university.' }),
        ApiParam({ name: 'universityId', description: 'University id' }),
        ApiQuery({ name: 'page', required: false, description: 'Page number' }),
        ApiResponse({ status: 200, description: 'Admissions list for university', schema: { example: { data: [{ _id: '617f1f77bcf86cd7994390ab', admission_title: 'BSc Computer Science Fall 2025' }], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } } } }),
    );
}
