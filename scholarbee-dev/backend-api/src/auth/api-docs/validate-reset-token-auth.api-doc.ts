import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';

export function ValidateResetTokenAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Validate reset token', description: 'Check if a password reset token is valid and not expired.' }),
        ApiParam({ name: 'token', description: 'Password reset token', required: true, type: String }),
        ApiResponse({ status: 200, description: 'Token valid', schema: { example: { success: true, message: 'Token is valid' } } }),
        ApiBadRequestResponse({ description: 'Invalid or expired token' }),
    );
}
