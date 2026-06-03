import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function RemoveApplicationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete application' }),
    ApiParam({ name: 'applicationId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deleted application', schema: { example: { _id: '651234abcd5678ef9012cdf0', deleted: true } } }),
  );
}


