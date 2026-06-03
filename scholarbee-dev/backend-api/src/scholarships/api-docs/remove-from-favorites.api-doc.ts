import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RemoveFromFavoritesApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Remove scholarship from favorites', description: 'Authenticated user removes scholarship from their favorites.' }),
        ApiParam({ name: 'id', required: true, description: 'Scholarship ID' }),
        ApiResponse({ status: 200, description: 'Updated scholarship', schema: { example: { _id: '617f1f77bcf86cd799439099', favouriteBy: [] } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
