import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindOneExternalApplicationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get external application by ID' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'External application document', schema: { example: { _id: '651234abcd5678ef9012ea01', program: '651234abcd5678ef9012p001' } } }),
  );
}


