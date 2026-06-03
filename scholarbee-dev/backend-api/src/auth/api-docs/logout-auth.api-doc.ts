import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function LogoutAuthApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Logout user', description: 'Revokes the refresh token for the authenticated user and signs them out.' }),
        ApiResponse({ status: 200, description: 'Successfully signed out', schema: { example: { message: 'Successfully signed out' } } }),
        ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' }),
    );
}
