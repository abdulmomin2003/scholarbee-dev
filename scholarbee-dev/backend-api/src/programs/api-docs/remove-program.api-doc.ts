import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RemoveProgramApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete program (admin)', description: 'Delete a program by ID. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deleted program', schema: { example: { _id: '651234abcd5678ef9012p001', deleted: true } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

