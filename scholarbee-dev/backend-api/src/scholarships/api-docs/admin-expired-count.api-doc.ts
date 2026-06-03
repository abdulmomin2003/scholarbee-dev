import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function AdminExpiredCountApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Get expired scholarships count', description: 'Admin endpoint that returns count of scholarships that should be expired but are still open.' }),
        ApiResponse({ status: 200, description: 'Count result', schema: { example: { expiredCount: 5 } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
