import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function getUserFavoriteCampusApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Get all favorite campuses of the user',
            description: 'Returns a paginated list of campuses that the authenticated user has marked as favorites'
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
            description: 'List of favorite campuses retrieved successfully',
            schema: {
                example: {
                    data: [{
                        id: '507f1f77bcf86cd799439011',
                        name: 'Main Campus',
                        university_id: {
                            id: '507f1f77bcf86cd799439012',
                            name: 'University Name'
                        },
                        address_id: {
                            city: 'Karachi',
                            state: 'Sindh',
                            country: 'Pakistan'
                        },
                        accreditations: 'HEC Approved',
                        isFavorite: true
                    }],
                    meta: {
                        total: 5,
                        page: 1,
                        limit: 10,
                        pages: 1
                    }
                }
            }
        }),
        ApiUnauthorizedResponse({
            description: 'Unauthorized - Invalid or missing authentication token'
        }),
    );
}

