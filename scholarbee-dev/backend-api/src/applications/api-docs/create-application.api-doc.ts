import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateApplicationDto } from '../dto/create-application.dto';

export function CreateApplicationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create application draft', description: 'Create a new application draft for the authenticated user.' }),
    ApiBody({
      type: CreateApplicationDto,
      examples: {
        default: {
          value: {
            admission_program_id: '651234abcd5678ef9012cde1',
            campus_id: '651234abcd5678ef9012cde2',
            program: '651234abcd5678ef9012cde3',
            admission: '651234abcd5678ef9012cde4',
            submission_date: '2025-01-10T10:00:00.000Z',
            total_processing_fee: 2500,
            accepted_legal_documents: ['651234abcd5678ef9012cde5'],
            departments: [
              {
                department: '651234abcd5678ef9012cde6',
                preferences: [
                  { program: '651234abcd5678ef9012cde7', preference_order: '1st' },
                  { program: '651234abcd5678ef9012cde8', preference_order: '2nd' },
                ],
              },
            ],
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Application draft created', schema: { example: { _id: '651234abcd5678ef9012cdf0', status: 'Draft' } } }),
  );
}


