import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateCampusDto } from '../dto/create-campus.dto';

export function CreateCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create campus', description: 'Create a new campus. Requires authentication.' }),
    ApiBody({
      type: CreateCampusDto,
      examples: {
        default: {
          value: {
            name: 'Main Campus',
            university_id: '651234abcd5678ef9012u001',
            address_id: '651234abcd5678ef9012a001',
            entity_type: 'public',
            established_date: '1995-09-01T00:00:00.000Z',
            campus_area: 150.5,
            website: 'https://main.example.edu',
            contact_phone: '+1-555-0100',
            contact_email: 'info@example.edu',
            logo_url: 'https://cdn.example.com/logo.png',
            latitude: 40.7128,
            longitude: -74.006,
            student_population: 12000,
            library_facilities: true,
            sports_facilities: true,
            dining_options: true,
            transportation_options: true,
            residential_facilities: false,
            healthcare_facilities: true,
            parking_facilities: true,
            security_features: true,
            facilities: 'Library, Labs, Sports Complex',
            accreditations: 'HEC',
            is_primary: true,
            pictures: ['https://cdn.example.com/campus1.jpg'],
            faculty_count: 350,
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Campus created', schema: { example: { _id: '651234abcd5678ef9012c001', name: 'Main Campus' } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}


