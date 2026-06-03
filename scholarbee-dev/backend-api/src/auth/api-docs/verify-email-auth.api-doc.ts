import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';

export function VerifyEmailAuthApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Verify email',
            description: 'Verify user email using the verification token sent at signup or via the resend verification API. This endpoint will only verify the token if the user is not already verified. Verified users will receive an error if they attempt to use this endpoint.'
        }),
        ApiParam({ name: 'token', description: 'Email verification token', required: true, type: String }),
        ApiResponse({ status: 200, description: 'Email verified', schema: { example: { success: true, message: 'Email verified successfully' } } }),
        ApiBadRequestResponse({ description: 'Invalid or expired verification token, or user is already verified' }),
    );
}
