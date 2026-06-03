import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllLegalDocumentsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'List legal documents' }),
    ApiQuery({ name: 'document_type', required: false, type: String, enum: ['general_terms_and_conditions','application_terms_and_conditions','scholarship_terms_and_conditions','privacy_policy','contract','nda','disclaimer','refund_policy','cookie_policy','acceptable_use_policy','copyright_policy','eula','sla','partnership_agreement','vendor_agreement','data_processing_addendum','user_agreement','subscription_agreement','other'] }),
    ApiQuery({ name: 'document_types', required: false, type: [String], description: 'Multiple document types' }),
    ApiQuery({ name: 'applicable_on', required: false, type: String, enum: ['student_program_application','admin_create_scholarship','user_registration','campus_registration','university_registration','other'], description: 'Filter documents by legal action type - will include all document types required for this action' }),
    ApiQuery({ name: 'status', required: false, type: String, enum: ['draft','active','archived'] }),
    ApiQuery({ name: 'document_ids', required: false, type: [String], description: 'Array of document ObjectIds' }),
    ApiResponse({
      status: 200,
      description: 'Array of legal documents (without content field)',
      schema: {
        example: [
          {
            _id: '6512ld01',
            title: 'Privacy Policy',
            document_type: 'privacy_policy',
            version: 1,
            effective_date: '2025-01-01',
            status: 'active',
          },
        ],
      },
    }),
  );
}


