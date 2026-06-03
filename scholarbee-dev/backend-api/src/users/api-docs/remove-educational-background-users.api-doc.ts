import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';

export function RemoveEducationalBackgroundUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Remove educational background', description: 'Remove an educational background from the user.' }),
        ApiParam({ name: 'id', required: true, description: 'User ID' }),
        ApiParam({ name: 'backgroundId', required: true, description: 'Educational background ID' }),
        ApiResponse({ status: 200, description: 'Updated user after removal', schema: { example: { _id: '507f1f77bcf86cd799439011', educational_backgrounds: [] } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
