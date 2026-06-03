import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function GetRegistrationLegalRequirementsUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Get registration legal document requirements', description: 'Returns the legal documents required for user registration.' }),
        ApiResponse({
            status: 200,
            description: 'Array of legal document descriptors',
            schema: {
                example: [
                    {
                        _id: '607f1f77bcf86cd799439012',
                        title: 'Identity Document',
                        description: 'National identity card required for registration',
                        required: true
                    }
                ]
            }
        }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
