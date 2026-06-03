import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllAcademicDepartmentsApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'List academic departments',
            description:
                'Retrieve a paginated list of academic departments with optional filters and sorting.',
        }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (1-indexed)' }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page' }),
        ApiQuery({ name: 'sort', required: false, type: String, example: 'createdAt', description: 'Field to sort by' }),
        ApiQuery({ name: 'order', required: false, type: String, example: 'desc', description: 'Sort order: asc | desc' }),
        ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by department name' }),
        ApiQuery({ name: 'campus_id', required: false, type: String, description: 'Filter by campus id' }),
        ApiResponse({
            status: 200,
            description: 'Paginated departments list',
            schema: {
                example: {
                    data: [
                        {
                            _id: '651234abcd5678ef9012cdef',
                            name: 'Computer Science',
                            campus_id: '64f1a2b3c4d5e6f7890a1234',
                            contact_phone: '+1-555-123-4567',
                            contact_email: 'cs-dept@example.edu',
                            head_of_department: 'Dr. Ada Lovelace',
                            createdBy: '6500aa11bb22cc33dd44ee55',
                            createdAt: '2025-01-01T12:00:00.000Z',
                            updatedAt: '2025-01-01T12:00:00.000Z',
                            __v: 0,
                        },
                    ],
                    meta: {
                        total: 1,
                        page: 1,
                        limit: 10,
                        pages: 1,
                    },
                },
            },
        }),
    );
}


