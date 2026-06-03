import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RemoveRegionApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete region (admin)', description: 'Delete a region by ID. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deleted region', schema: { example: { _id: '651234abcd5678ef9012r001', deleted: true } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

