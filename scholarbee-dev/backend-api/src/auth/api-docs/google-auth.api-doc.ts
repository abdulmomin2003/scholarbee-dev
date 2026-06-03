import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function GoogleAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Initiate Google OAuth flow', description: 'Redirects user to Google for OAuth authentication. (Frontend Dependent)' }),
        ApiResponse({ status: 302, description: 'Redirect to Google OAuth consent screen' }),
        ApiUnauthorizedResponse({ description: 'OAuth initiation failed' }),
    );
}
