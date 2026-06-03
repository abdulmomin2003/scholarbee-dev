import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export function FindStudentScholarshipsApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'List student scholarships', description: 'Returns a paginated list of student scholarships using filter and search query parameters.' }),
        ApiQuery({ name: 'search', required: false, description: 'Search text' }),
        ApiQuery({ name: 'father_status', required: false, description: 'Filter by status (alive, deceased)' }),
        ApiQuery({ name: 'approval_status', required: false, description: 'Filter by status (Applied, Approved, Rejected)' }),
        ApiQuery({ name: 'scholarship_id', required: false, description: 'Filter by scholarship ID' }),
        ApiQuery({ name: 'page', required: false, description: 'Page number' }),
        ApiResponse({ status: 200, description: 'Paginated student scholarships list', schema: { example: { data: [{ _id: '617f1f77bcf86cd7994390aa', scholarship_id: '617f1f77bcf86cd799439099', student_id: '507f1f77bcf86cd799439011', status: 'pending' }], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } } } }),
    );
}
