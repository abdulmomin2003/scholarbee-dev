import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiQuery } from '@nestjs/swagger';

export function GetStudentSignupsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get student signups list',
      description:
        'Returns a paginated list of student signups filtered by date range and/or a text search query. ' +
        'The `search` parameter performs a case-insensitive regex match against `full_name`, `first_name`, `last_name`, and `student_id`. ' +
        'Requires Super Admin privileges.',
    }),
    ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)' }),
    ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)' }),
    ApiQuery({
      name: 'search',
      required: false,
      description:
        'Free-text search term. Matches case-insensitively against full_name, first_name, last_name, and student_id.',
      example: 'john',
    }),
    ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' }),
    ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' }),
    ApiResponse({
      status: 200,
      description: 'Paginated student signups list',
      schema: {
        example: {
          docs: [
            {
              _id: '507f1f77bcf86cd799439011',
              full_name: 'John Doe',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              student_id: 'SB_000000001',
              phone_number: '+923001234567',
              created_at: '2025-01-15T10:30:00.000Z',
              nationality: 'Pakistan',
              onboarding_preferences: {
                degree_goal: 'bachelors',
                preferred_cities: ['Lahore', 'Islamabad'],
                preferred_fields_of_study: ['Computer Science', 'Software Engineering'],
                semester_fee_range: { min: 50000, max: 150000 },
                previous_marks_range: { min_percent: 60, max_percent: 80 },
                start_timeline: {
                  type: 'within_6_months',
                  selected_at: '2025-01-15T10:30:00.000Z',
                },
                version: 1,
                updated_at: '2025-01-15T10:30:00.000Z',
              },
            },
          ],
          totalDocs: 45,
          page: 1,
          totalPages: 5,
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Authentication required' }),
    ApiForbiddenResponse({ description: 'Super Admin privileges required' }),
  );
}

