import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export function UpdateEducationalBackgroundUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Update educational background', description: 'Partially update an existing educational background record.' }),
        ApiParam({ name: 'id', required: true, description: 'User ID' }),
        ApiParam({ name: 'backgroundId', required: true, description: 'Educational background ID' }),
        ApiBody({ description: 'Partial educational background fields', schema: { example: { field_of_study: 'Software Engineering', marks_gpa: { total_marks_gpa: '4.00', obtained_marks_gpa: '3.80' } } } }),
        ApiResponse({ status: 200, description: 'Update result', schema: { example: { modifiedCount: 1 } } }),
        ApiResponse({ status: 500, description: 'User with ID 66c5a55fff413badaa20adc6 not found', schema: { example: { modifiedCount: 0 } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
