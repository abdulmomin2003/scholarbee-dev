import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function GetProgramDetailApiDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get programs detail list by filters',
      description:
        'Returns a paginated array of programs matching the given filters. ' +
        'All filters are optional — omitting all returns all non-deleted programs (paginated). ' +
        'Each item includes campus, university, fee structure, and admissions information.',
    }),
    ApiQuery({
      name: 'campus_slug',
      required: false,
      type: String,
      description: 'Filter by campus slug (e.g., "fast-nuces-peshawar-campus")',
      example: 'fast-nuces-peshawar-campus',
    }),
    ApiQuery({
      name: 'seo_title_key',
      required: false,
      type: String,
      description: 'Filter by program template SEO title key (e.g., "bs-computer-science")',
      example: 'bs-computer-science',
    }),
    ApiQuery({
      name: 'city',
      required: false,
      type: String,
      description: 'Filter by city name (case-insensitive)',
      example: 'Peshawar',
    }),
    ApiQuery({
      name: 'degree_level',
      required: false,
      type: String,
      description: 'Filter by degree level (case-insensitive)',
      example: 'Bachelors',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (default: 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of results per page (default: 10)',
      example: 10,
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated array of matching programs',
      schema: {
        example: [
          {
            _id: '651234abcd5678ef9012p001',
            name: 'Computer Science',
            degree_level: 'Bachelors',
            major: 'Computer Science',
            duration: '48 Months',
            credit_hours: 120,
            language_of_instruction: 'English',
            mode_of_study: 'Onsite',
            accreditations: 'HEC Approved',
            intake_periods: ['Fall 2024', 'Spring 2025'],
            scholarship_options: 'Merit-based, Need-based',
            tags: ['engineering', 'stem'],
            campus: {
              _id: '651234abcd5678ef9012c001',
              name: 'Peshawar Campus',
              slug: 'fast-nuces-peshawar-campus',
              city: 'Peshawar',
              state: 'KPK',
              country: 'Pakistan',
            },
            university: {
              _id: '651234abcd5678ef9012u001',
              name: 'FAST National University',
              type: 'private',
              abbreviation: 'FAST-NUCES',
              slug: 'fast-nuces',
            },
            fee_structure: {
              _id: '651234abcd5678ef9012f001',
              semester_fee: 150000,
              total_fee: 1200000,
              currency: 'PKR',
            },
            admissions: [],
            createdAt: '2024-01-15T10:30:00.000Z',
          },
        ],
      },
    }),
    ApiNotFoundResponse({
      description: 'No programs found matching the given filters',
      schema: {
        example: {
          statusCode: 404,
          message: 'Program not found with filters: campus_slug="fast-nuces-peshawar-campus"',
        },
      },
    }),
  );
}
