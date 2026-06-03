import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiQuery } from '@nestjs/swagger';

export function GoogleAuthCallbackAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Google OAuth callback', description: 'Handle Google OAuth callback, exchange code for user info and issue tokens. (Frontend Dependent)' }),
        ApiQuery({ name: 'code', required: false, description: 'OAuth code returned by Google' }),
        ApiResponse({ status: 302, description: 'Redirect to frontend with tokens in query string' }),
        ApiUnauthorizedResponse({ description: 'OAuth callback failed or invalid Google profile' }),
    );
}
