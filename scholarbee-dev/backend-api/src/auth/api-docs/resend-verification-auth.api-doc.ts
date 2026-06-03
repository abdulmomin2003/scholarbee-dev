import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ResendVerificationDto } from '../dto/resend-verification.dto';

export function ResendVerificationAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Resend verification email', description: 'Resend the email verification link to a user email address. This endpoint will fail if the user is already verified.' }),
        ApiBody({
            type: ResendVerificationDto, description: 'Email payload',
            examples: {
                'Basic Program': {
                    value: {
                        "email": "shahzeb@pickysolutions.com"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Verification email resent', schema: { example: { success: true, message: 'Verification email sent' } } }),
        ApiBadRequestResponse({ description: 'Invalid input, resend not allowed, or user is already verified. Verified users cannot receive verification emails.' }),
    );
}
