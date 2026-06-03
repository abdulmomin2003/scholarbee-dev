import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindOneApplicationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get application by ID' }),
    ApiParam({ name: 'applicationId', required: true, type: String }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: true }),
    ApiResponse({ status: 200, description: 'Application document', schema: { example: { _id: '651234abcd5678ef9012cdf0', status: 'Draft' } } }),
  );
}


