import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function DeleteScholarshipApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Delete scholarship', description: 'Admin deletes a scholarship by ID.' }),
        ApiParam({ name: 'id', required: true, description: 'Scholarship ID' }),
        ApiResponse({ status: 200, description: 'Deletion result', schema: { example: { deleted: true } } }),
        ApiResponse({ status: 403, description: 'Forbidden resource' }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
