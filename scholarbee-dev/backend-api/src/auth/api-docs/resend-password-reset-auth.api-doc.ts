import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ResendPasswordResetDto } from '../dto/resend-password-reset.dto';

export function ResendPasswordResetAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Resend password reset email', description: 'Resend a password reset email to the provided address. (Frontend Dependent)' }),
        ApiBody({ type: ResendPasswordResetDto, description: 'Email payload' }),
        ApiResponse({ status: 200, description: 'Password reset email resent', schema: { example: { success: true, message: 'Password reset email sent successfully' } } }),
        ApiNotFoundResponse({ description: 'User not found' }),
        ApiBadRequestResponse({ description: 'Password reset not available for social accounts' }),
    );
}
