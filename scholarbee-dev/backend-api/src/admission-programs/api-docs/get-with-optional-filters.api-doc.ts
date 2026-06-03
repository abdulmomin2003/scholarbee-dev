import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function getWithOptionalFiltersAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiOperation({
            summary: 'Get all admission programs with optional filters',
            description: 'Returns a paginated list of admission programs with optional search and filter criteria'
        }),
        ApiQuery({
            name: 'search',
            required: false,
            type: String,
            description: 'Search text across admission program fields'
        }),
        ApiQuery({
            name: 'admission',
            required: false,
            type: String,
            description: 'Filter by admission ID'
        }),
        ApiQuery({
            name: 'program',
            required: false,
            type: String,
            description: 'Filter by program ID'
        }),
        ApiQuery({
            name: 'minAvailableSeats',
            required: false,
            type: Number,
            description: 'Filter by minimum available seats'
        }),
        ApiQuery({
            name: 'maxAvailableSeats',
            required: false,
            type: Number,
            description: 'Filter by maximum available seats'
        }),
        ApiQuery({
            name: 'sortBy',
            required: false,
            type: String,
            description: 'Field to sort by',
            // default: 'createdAt'
        }),
        ApiQuery({
            name: 'sortOrder',
            required: false,
            enum: ['asc', 'desc'],
            description: 'Sort order',
            // default: 'desc'
        }),
        ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Page number'
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: 'Items per page'
        }),
        ApiQuery({
            name: 'populate',
            required: false,
            type: Boolean,
            description: 'Whether to populate related entities',
            // default: true
        }),
        ApiResponse({
            status: 200,
            description: 'List of admission programs retrieved successfully',
            schema: {
                example: {
                    data: [{
                        id: '507f1f77bcf86cd799439011',
                        admission: {
                            id: '507f1f77bcf86cd799439012',
                            name: 'Fall 2024 Admission'
                        },
                        program: {
                            id: '507f1f77bcf86cd799439013',
                            name: 'Computer Science',
                            degree_level: 'BACHELORS'
                        },
                        admission_fee: '50000',
                        available_seats: 100,
                        isFavorite: false,
                        admission_requirements: [
                            {
                                id: 'req1',
                                key: 'Academic Requirements',
                                value: [
                                    {
                                        type: 'paragraph',
                                        children: [{ text: 'Minimum GPA 3.0', bold: true }]
                                    }
                                ]
                            }
                        ]
                    }],
                    total: 150,
                    page: 1,
                    limit: 10,
                    hasMore: true
                }
            }
        })
    );
}