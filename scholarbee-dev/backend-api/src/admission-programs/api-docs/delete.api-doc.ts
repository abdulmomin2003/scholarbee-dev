import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';

export function deleteAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Delete an admission program by ID',
            description: 'Permanently removes an admission program. Requires authentication and proper permissions.'
        }),
        ApiParam({
            name: 'id',
            description: 'Admission program ID (MongoDB ObjectId)',
            type: String,
            required: true,
        }),
        ApiResponse({
            status: 200,
            description: 'Admission program successfully deleted',
            schema: {
                example: {
                    statusCode: 200,
                    message: 'Admission program deleted successfully'
                }
            }
        }),
        ApiUnauthorizedResponse({
            description: 'Unauthorized - Invalid or missing authentication token',
        }),
        ApiForbiddenResponse({
            description: 'Forbidden - User does not have permission to delete this admission program',
        }),
        ApiNotFoundResponse({
            description: 'Not Found - Admission program with the specified ID does not exist',
        }),
    );
}