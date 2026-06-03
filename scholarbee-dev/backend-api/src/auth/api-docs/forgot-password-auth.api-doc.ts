import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

export function ForgotPasswordAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Request password reset', description: 'Send password reset email to the provided address if account exists.' }),
        ApiBody({
            type: ForgotPasswordDto, description: 'Email for password reset',
            examples: {
                'Basic Program': {
                    value: {
                        "email": "shahzeb@pickysolutions.com"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Password reset email queued/sent', schema: { example: { success: true, message: 'Password reset email sent successfully' } } }),
        ApiNotFoundResponse({ description: 'User not found' }),
        ApiBadRequestResponse({ description: 'Password reset not available for social accounts' }),
    );
}
