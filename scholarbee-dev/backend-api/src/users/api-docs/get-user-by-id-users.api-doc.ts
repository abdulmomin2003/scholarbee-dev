import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';

export function GetUserByIdUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Get user by ID', description: 'Return a sanitized user document by ID.' }),
        ApiParam({ name: 'id', required: true, description: 'User ID' }),
        ApiResponse({
            status: 200,
            description: 'Sanitized user object',
            schema: {
                example: {
                    _id: '507f1f77bcf86cd799439011',
                    email: 'user@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    phone_number: '+923001234567',
                    user_type: 'student'
                }
            }
        }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
