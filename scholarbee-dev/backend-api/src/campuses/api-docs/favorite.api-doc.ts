import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function favoriteCampusApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Add a campus to user favorites',
            description: 'Adds the specified campus to the authenticated user\'s favorites list'
        }),
        ApiParam({
            name: 'campus_id',
            description: 'Campus ID (MongoDB ObjectId)',
            type: String,
            required: true,
        }),
        ApiResponse({
            status: 200,
            description: 'Campus added to favorites successfully',
            schema: {
                example: {
                    id: '507f1f77bcf86cd799439011',
                    message: 'Added to favorites successfully'
                }
            }
        }),
        ApiUnauthorizedResponse({
            description: 'Unauthorized - Invalid or missing authentication token',
        }),
        ApiNotFoundResponse({
            description: 'Not Found - Campus with the specified ID does not exist',
        }),
    );
}

