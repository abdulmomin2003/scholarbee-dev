import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

export function FindAdmissionsByCampusApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find admissions by campus', description: 'List admissions for a specific campus.' }),
        ApiParam({ name: 'campusId', description: 'Campus id' }),
        ApiQuery({ name: 'page', required: false, description: 'Page number' }),
        ApiResponse({ status: 200, description: 'Admissions list for campus', schema: { example: { data: [{ _id: '617f1f77bcf86cd7994390ab', admission_title: 'BSc Computer Science Fall 2025' }], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } } } }),
    );
}
