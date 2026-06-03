import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindFeesByProgramApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Find fees by program ID' }),
    ApiParam({ name: 'programId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Fees for the program', schema: { example: [{ _id: '6512fee01', program_id: '6512p001' }] } }),
  );
}


