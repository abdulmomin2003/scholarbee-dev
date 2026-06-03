import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function getUserFavoriteAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Get all favorite admission programs of the user',
            description: 'Returns a paginated list of admission programs that the authenticated user has marked as favorites'
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
        ApiResponse({
            status: 200,
            description: 'List of favorite admission programs retrieved successfully',
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
                            name: 'Computer Science'
                        },
                        admission_fee: '50000',
                        available_seats: 100,
                        isFavorite: true
                    }],
                    total: 5,
                    page: 1,
                    limit: 10
                }
            }
        }),
        ApiUnauthorizedResponse({
            description: 'Unauthorized - Invalid or missing authentication token'
        }),
    );
}