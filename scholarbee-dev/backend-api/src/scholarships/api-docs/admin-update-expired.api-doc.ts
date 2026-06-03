import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function AdminUpdateExpiredApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Manually trigger expired scholarships update', description: 'Admin endpoint to run the cron job that closes expired scholarships.' }),
        ApiResponse({ status: 200, description: 'Completed', schema: { example: { message: 'Expired scholarships update completed' } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
