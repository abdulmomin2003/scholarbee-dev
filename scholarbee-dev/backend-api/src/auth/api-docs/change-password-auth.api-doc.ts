import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ChangePasswordDto } from '../dto/change-password.dto';

export function ChangePasswordAuthApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Change password', description: 'Change password for authenticated user; requires current password.' }),
        ApiBody({
            type: ChangePasswordDto, description: 'Current and new password',
            examples: {
                'Basic Program': {
                    value: {
                        "currentPassword": "CurrentPassword123!",
                        "newPassword": "NewPassword123!"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Password changed successfully', schema: { example: { success: true, message: 'Password changed successfully' } } }),
        ApiBadRequestResponse({ description: 'Invalid credentials or invalid input' }),
        ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' }),
    );
}
