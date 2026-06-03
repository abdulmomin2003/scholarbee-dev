import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllLegalDocumentRequirementsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'List legal document requirements' }),
    ApiQuery({ name: 'applicable_on', required: false, type: String, enum: ['student_program_application','admin_create_scholarship','user_registration','campus_registration','university_registration','other'] }),
    ApiResponse({
      status: 200,
      description: 'Array of legal document requirements',
      schema: {
        example: [
          {
            _id: '6512ldr01',
            applicable_on: 'student_program_application',
            required_document_types: ['cnic_front','cnic_back'],
            description: 'Required for verification.'
          }
        ]
      }
    }),
  );
}


