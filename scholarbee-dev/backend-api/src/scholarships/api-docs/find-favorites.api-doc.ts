import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiQuery } from '@nestjs/swagger';

export function FindFavoritesApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'List user favorite scholarships', description: 'Return paginated favorites for the authenticated user.' }),
        ApiQuery({ name: 'page', required: false, description: 'Page number' }),
        ApiResponse({ status: 200, description: 'Paginated favorites', schema: { example: { data: [{ _id: '617f1f77bcf86cd799439099', scholarship_name: 'Merit 2025' }], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
