import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindOneCampusApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get campus by ID' }),
    ApiParam({ name: 'campus_id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Campus document', schema: { example: { _id: '651234abcd5678ef9012c001', name: 'Main Campus' } } }),
  );
}


