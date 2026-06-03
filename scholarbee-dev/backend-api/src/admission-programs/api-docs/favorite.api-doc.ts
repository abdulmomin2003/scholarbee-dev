import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function favoriteAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Add an admission program to user favorites',
            description: 'Adds the specified admission program to the authenticated user\'s favorites list'
        }),
        ApiParam({
            name: 'adm_prg_id',
            description: 'Admission program ID (MongoDB ObjectId)',
            type: String,
            required: true,
        }),
        ApiResponse({
            status: 200,
            description: 'Admission program added to favorites successfully',
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
            description: 'Not Found - Admission program with the specified ID does not exist',
        }),
    );
}