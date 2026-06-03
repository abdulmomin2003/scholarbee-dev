import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';

export function DeleteStudentScholarshipApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Delete student scholarship', description: 'Delete a student scholarship by id (admin or owner).' }),
        ApiParam({ name: 'id', description: 'Student scholarship id' }),
        ApiResponse({ status: 200, description: 'Student scholarship deleted', schema: { example: { success: true } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
