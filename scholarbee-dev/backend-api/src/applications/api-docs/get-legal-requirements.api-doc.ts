import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetApplicationLegalRequirementsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Application legal document requirements' }),
    ApiResponse({ status: 200, description: 'List of required legal documents', schema: { example: [{ _id: 'doc1', name: 'CNIC' }] } }),
  );
}


