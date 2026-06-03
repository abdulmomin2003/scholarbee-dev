import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function AddToFavoritesApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Add scholarship to favorites', description: 'Authenticated user adds scholarship to their favorites.' }),
        ApiParam({ name: 'scholarshipId', required: true, description: 'Scholarship ID' }),
        ApiResponse({ status: 200, description: 'Updated scholarship', schema: { example: { _id: '617f1f77bcf86cd799439099', favouriteBy: ['507f1f77bcf86cd799439011'] } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
