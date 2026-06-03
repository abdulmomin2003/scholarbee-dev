import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { CreateProgramDto } from '../dto/create-program.dto';

export function CreateProgramApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create program (Campus Admin)',
      description: 'Create a new program for the authenticated campus admin\'s campus. The campus_id is automatically set from the authenticated user\'s context. Requires Campus Admin authentication.'
    }),
    ApiBody({
      type: CreateProgramDto,
      examples: {
        default: {
          summary: 'Complete program creation example',
          value: {
            name: 'Bachelor of Computer Science',
            major: 'Computer Science',
            duration: '48 Months',
            credit_hours: 130,
            language_of_instruction: 'English',
            accreditations: 'HEC, PEC',
            mode_of_study: 'Online',
            scholarship_options: 'Merit-based scholarships available',
            sorting_weight: '1',
            degree_level: 'Bachelors',
            academic_departments: '674db3b19903400d09acad47',
            template: '651234abcd5678ef9012template1',
            fee_structure: '651234abcd5678ef9012fee1',
          },
        },
        minimal: {
          summary: 'Minimal required fields',
          value: {
            name: 'Bachelor of Computer Science',
            degree_level: 'Bachelors',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Program created successfully',
      schema: {
        example: {
          _id: '651234abcd5678ef9012p001',
          name: 'Bachelor of Computer Science',
          major: 'Computer Science',
          degree_level: 'Bachelors',
          duration: '48 Months',
          credit_hours: 130,
          campus_id: '651234abcd5678ef9012c001',
          fee_structure: '651234abcd5678ef9012fee1',
          createdAt: '2025-01-01T12:00:00.000Z',
          updatedAt: '2025-01-01T12:00:00.000Z',
        }
      }
    }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' }),
    ApiForbiddenResponse({ description: 'User does not have permission to create programs (not a Campus Admin)' }),
  );
}

