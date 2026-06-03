import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllAddressesApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'List addresses', description: 'Retrieve a paginated list of addresses with sorting controls.' }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (1-indexed)' }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page' }),
        ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt', description: 'Field to sort by' }),
        ApiQuery({ name: 'order', required: false, type: String, example: 'desc', description: 'Sort order: asc | desc' }),
        ApiResponse({
            status: 200,
            description: 'Paginated list',
            schema: {
                example: {
                    data: [
                        {
                            _id: '651234abcd5678ef9012cdef',
                            address_line_1: '221B Baker Street',
                            address_line_2: 'Flat B',
                            city: 'London',
                            state: 'Greater London',
                            country: 'UK',
                            postal_code: 'NW1 6XE',
                            latitude: 51.523767,
                            longitude: -0.1585557,
                            createdBy: '6500aa11bb22cc33dd44ee55',
                            createdAt: '2025-01-01T12:00:00.000Z',
                            updatedAt: '2025-01-01T12:00:00.000Z',
                            __v: 0,
                        },
                    ],
                    meta: { total: 1, page: 1, limit: 10, pages: 1 },
                },
            },
        }),
    );
}


