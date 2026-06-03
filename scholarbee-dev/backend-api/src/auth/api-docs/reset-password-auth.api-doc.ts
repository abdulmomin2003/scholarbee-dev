import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ResetPasswordDto } from '../dto/reset-password.dto';

export function ResetPasswordAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Reset password', description: 'Reset user password using a valid reset token.' }),
        ApiParam({ name: 'token', description: 'Password reset token', required: true, type: String }),
        ApiBody({
            type: ResetPasswordDto, description: 'New password payload',
            examples: {
                'Basic Program': {
                    value: {
                        "password": "Pickysolutions@122"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Password reset successful', schema: { example: { success: true, message: 'Password reset successful' } } }),
        ApiBadRequestResponse({ description: 'Invalid or expired token' }),
    );
}
