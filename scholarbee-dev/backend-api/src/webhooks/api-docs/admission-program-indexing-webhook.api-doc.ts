import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { AdmissionProgramIndexingWebhookDto } from '../dto/admission-program-indexing-webhook.dto';

export function AdmissionProgramIndexingWebhookApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Admission program indexing webhook', description: 'Handles webhook for indexing admission program data to Elasticsearch. Requires webhook authentication and rate limiting.' }),
    ApiBody({
      type: AdmissionProgramIndexingWebhookDto,
      examples: {
        default: {
          value: {
            doc_id: '651234abcd5678ef9012ap01',
            campus_image: 'https://cdn.example.com/campus.jpg',
            location_details: {
              complete_address: '123 University Ave, Lahore',
              city: 'Lahore',
              state: 'Punjab',
              country: 'Pakistan',
              latitude: 31.5204,
              longitude: 74.3587,
            },
            university_logo: 'https://cdn.example.com/logo.png',
            program_title: 'Bachelor of Computer Science',
            study_mode: 'onsite',
            tuition_fee: 150000,
            university_id: '651234abcd5678ef9012u001',
            university_name: 'Lahore University',
            campus_id: '651234abcd5678ef9012c001',
            campus_name: 'Main Campus',
            campus_level: 1,
            program_id: '651234abcd5678ef9012p001',
            admission_id: '651234abcd5678ef9012ad01',
            degree_level: 'Bachelors',
            intake_period: 'Fall 2025',
            admission_startdate: '2025-01-01T00:00:00.000Z',
            admission_enddate: '2025-06-30T23:59:59.000Z',
            major: 'Computer Science',
            currency: 'PKR',
            createdAt: '2025-01-01T12:00:00.000Z',
            updatedAt: '2025-01-01T12:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Indexing webhook processed successfully', schema: { example: { success: true, message: 'Admission program indexed to Elasticsearch' } } }),
    ApiUnauthorizedResponse({ description: 'Invalid webhook authentication' }),
    ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' }),
  );
}

