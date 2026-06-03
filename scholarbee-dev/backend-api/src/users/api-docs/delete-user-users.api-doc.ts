import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';

export function DeleteUserUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Delete user', description: 'Delete user by ID.' }),
        ApiParam({ name: 'id', required: true, description: 'User ID' }),
        ApiResponse({ status: 200, description: 'User deleted', schema: { example: { message: 'User removed successfully' } } }),
        ApiResponse({ status: 404, description: 'User not found', schema: { example: { message: 'User not found' } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
