import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RemoveUniversityApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete university', description: 'Delete a university by ID. Requires authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deleted university', schema: { example: { _id: '651234abcd5678ef9012u001', deleted: true } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

