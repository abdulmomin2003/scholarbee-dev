import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateContactDto } from '../dto/create-contact.dto';

export function CreateContactApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Submit contact request', description: 'Public endpoint to submit a contact-us inquiry.' }),
    ApiBody({
      type: CreateContactDto,
      examples: {
        default: {
          value: {
            name: 'Ali Khan',
            email: 'ali@example.com',
            phone: '+92-300-1234567',
            type: 'registration',
            is_scholarship: true,
            message: 'I want to know about scholarship deadlines.',
            gender: 'Male',
            study_level: 'Undergraduate',
            study_country: 'Pakistan',
            study_city: 'Lahore',
            campusesIds: ['651234abcd5678ef9012c001'],
            user_type: 'Student',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Contact created', schema: { example: { _id: '651234abcd5678ef9012ct01', name: 'Ali Khan' } } }),
  );
}


