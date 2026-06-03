import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RemoveCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete campus', description: 'Delete a campus by ID. Requires authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deleted campus document', schema: { example: { _id: '651234abcd5678ef9012c001', deleted: true } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}


