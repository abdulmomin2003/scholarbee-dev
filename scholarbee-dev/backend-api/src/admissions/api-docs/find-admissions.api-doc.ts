import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export function FindAdmissionsApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'List admissions', description: 'Returns a paginated list of admissions with optional filters.' }),
        ApiQuery({ name: 'search', required: false, description: 'Search text' }),
        ApiQuery({ name: 'university_id', required: false, description: 'Filter by university id' }),
        ApiQuery({ name: 'campus_id', required: false, description: 'Filter by campus id' }),
        ApiQuery({ name: 'admission_deadline_before', required: false, description: 'Filter deadlines before this date' }),
        ApiQuery({ name: 'admission_deadline_after', required: false, description: 'Filter deadlines after this date' }),
        ApiQuery({ name: 'page', required: false, description: 'Page number' }),
        ApiResponse({ status: 200, description: 'Paginated admissions list', schema: { example: { data: [{ _id: '617f1f77bcf86cd7994390ab', admission_title: 'BSc Computer Science Fall 2025', campus_id: '6503cbea5652e43948728a3a' }], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } } } }),
    );
}
