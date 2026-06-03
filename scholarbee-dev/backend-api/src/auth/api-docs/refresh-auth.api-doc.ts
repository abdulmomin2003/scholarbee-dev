import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';

export function RefreshAuthApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Refresh authentication tokens', description: 'Exchange a valid refresh token for a new access token and refresh token.' }),
        ApiResponse({
            status: 200,
            description: 'New tokens issued',
            schema: {
                example: {
                    token: 'eyJhbGci...access',
                    accessToken: 'eyJhbGci...access',
                    refreshToken: 'eyJhbGci...refresh',
                    userId: '507f1f77bcf86cd799439011',
                    username: 'user@example.com'
                }
            }
        }),
        ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' }),
    );
}
