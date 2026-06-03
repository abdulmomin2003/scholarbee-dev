import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateUniversityDto } from '../dto/create-university.dto';

export function CreateUniversityApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create university', description: 'Create a new university. Requires authentication.' }),
    ApiBody({
      type: CreateUniversityDto,
      examples: {
        default: {
          value: {
            name: 'Lahore University of Management Sciences',
            founded: '1984-01-01T00:00:00.000Z',
            description: 'A leading private research university in Pakistan.',
            address_id: '651234abcd5678ef9012a001',
            website: 'https://www.lums.edu.pk',
            ranking: 'Ranked #1 in Pakistan',
            affiliations: 'HEC',
            motto: 'Learning Without Boundaries',
            colors: 'Maroon and Gold',
            mascot: 'Lion',
            type: 'private',
            total_students: 5000,
            total_faculty: 400,
            total_alumni: 25000,
            endowment: '$50M',
            campus_size: '100 acres',
            annual_budget: 500000000,
            research_output: 1200,
            international_students: 200,
            languages: 'English, Urdu',
            logo_url: 'https://cdn.example.com/lums-logo.png',
            accreditations: 'HEC, AACSB',
            notable_alumni: 'Nobel Laureates, CEOs',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'University created', schema: { example: { _id: '651234abcd5678ef9012u001', name: 'Lahore University of Management Sciences' } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

