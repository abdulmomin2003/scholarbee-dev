import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetOrCreateSupportCampusApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get or create support campus' }),
    ApiResponse({ status: 200, description: 'Support campus document', schema: { example: { _id: '651234abcd5678ef9012s001', name: 'Support Campus' } } }),
  );
}


