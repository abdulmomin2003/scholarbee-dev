import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllUniversitiesApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'List universities', description: 'Retrieve paginated universities with filters and sorting. Authentication optional.' }),
        ApiQuery({ name: 'name', required: false, type: String }),
        ApiQuery({ name: 'search', required: false, type: String, description: 'Search by university abbreviation or name' }),
        ApiQuery({ name: 'admission_program_status', required: false, type: String, enum: ['available', 'unavailable'] }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
        ApiQuery({ name: 'sortBy', required: false, type: String }),
        ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
        ApiResponse({
            status: 200,
            description: 'Paginated universities',
            schema: {
                example: {
                    data: [
                        {
                            _id: '651234abcd5678ef9012u001',
                            name: 'Lahore University of Management Sciences',
                            founded: '1984-01-01T00:00:00.000Z',
                            createdAt: '2025-01-01T12:00:00.000Z',
                        },
                    ],
                    meta: { total: 1, page: 1, limit: 10, pages: 1 },
                },
            },
        }),
    );
}

export function FindAllUniversitiesWithAvailableProgramsApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'List universities with available programs', description: 'Retrieve universities that have available/open programs. Authentication optional. TODO: Endpoint may be deprecated.' }),
        ApiQuery({ name: 'name', required: false, type: String }),
        ApiQuery({ name: 'search', required: false, type: String, description: 'Search by university abbreviation or name' }),
        ApiQuery({ name: 'admission_program_status', required: false, type: String, enum: ['available', 'unavailable'] }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
        ApiQuery({ name: 'sortBy', required: false, type: String }),
        ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
        ApiResponse({ status: 200, description: 'Paginated universities with available programs', schema: { example: { data: [], meta: { total: 0, page: 1, limit: 10, pages: 0 } } } }),
    );
}

