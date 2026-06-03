import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function HasValidAdminsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Check if campus has valid admins' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Boolean result', schema: { example: { hasAdmins: true } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}


