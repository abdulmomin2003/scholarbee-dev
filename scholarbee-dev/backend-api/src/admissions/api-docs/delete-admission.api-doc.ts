import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';

export function DeleteAdmissionApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Delete admission', description: 'Delete an admission posting (authenticated users).' }),
        ApiParam({ name: 'id', description: 'Admission id' }),
        ApiResponse({ status: 200, description: 'Admission deleted', schema: { example: { success: true } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
