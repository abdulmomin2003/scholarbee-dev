import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export function UpdateNationalIdCardUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Update national ID card', description: 'Update national ID card images.' }),
        ApiParam({ name: 'id', required: true, description: 'User ID' }),
        ApiBody({ description: 'National ID card partial update', schema: { example: { front_side: 'https://cdn.example.com/nic/new-front.jpg', back_side: 'https://cdn.example.com/nic/new-back.jpg' } } }),
        ApiResponse({ status: 200, description: 'User updated', schema: { example: { _id: '507f1f77bcf86cd799439011', national_id_card: { front_side: 'https://cdn.example.com/nic/new-front.jpg', back_side: 'https://cdn.example.com/nic/new-back.jpg' } } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
