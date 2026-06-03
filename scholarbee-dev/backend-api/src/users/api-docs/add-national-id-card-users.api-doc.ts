import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody, ApiParam } from '@nestjs/swagger';

export function AddNationalIdCardUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Add national ID card', description: 'Attach national ID card images and mark profile completion.' }),
        ApiParam({ name: 'id', required: true, description: 'User ID' }),
        ApiBody({
            description: 'National ID card payload',
            schema: {
                example: {
                    isProfileCompleted: true,
                    national_id_card: {
                        front_side: 'https://cdn.example.com/nic/front.jpg',
                        back_side: 'https://cdn.example.com/nic/back.jpg'
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'User updated with national ID card', schema: { example: { _id: '507f1f77bcf86cd799439011', email: 'user@example.com', isProfileCompleted: true, national_id_card: { front_side: 'https://cdn.example.com/nic/front.jpg', back_side: 'https://cdn.example.com/nic/back.jpg' } } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
