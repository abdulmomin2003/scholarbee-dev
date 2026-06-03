import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateExternalApplicationDto } from '../dto/create-external-application.dto';

export function CreateExternalApplicationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create external application', description: 'Create an external application for the authenticated user.' }),
    ApiBody({
      type: CreateExternalApplicationDto,
      examples: {
        default: {
          value: {
            admission_program: '651234abcd5678ef9012ap01',
            university: '651234abcd5678ef9012u001',
            campus: '651234abcd5678ef9012c001',
            program: '651234abcd5678ef9012p001',
            admission: '651234abcd5678ef9012ad01',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'External application created', schema: { example: { _id: '651234abcd5678ef9012ea01', status: 'submitted' } } }),
  );
}


