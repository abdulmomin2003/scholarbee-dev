import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindOneLegalDocumentRequirementApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get legal document requirement by ID' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Legal document requirement', schema: { example: { _id: '6512ldr01', applicable_on: 'student_program_application', required_document_types: ['cnic_front','cnic_back'], description: 'Required for verification.' } } }),
  );
}


