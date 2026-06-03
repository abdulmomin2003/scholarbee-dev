import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UniversityTypeEnum } from '../../universities/schemas/university.schema';

export function FindAllCampusesApiDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'List campuses',
      description: 'Retrieve paginated campuses with optional filters and sorting. Supports city/area filtering and includes favorite status for authenticated users.'
    }),
    ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by campus name (case-insensitive regex match)' }),
    ApiQuery({ name: 'admission_program_status', required: false, type: String, enum: ['available', 'unavailable'] }),
    ApiQuery({ name: 'university_type', required: false, enum: UniversityTypeEnum, isArray: true, explode: false, description: 'Filter by one or more university types. Accepts a comma-separated string (?university_type=government,private) or repeated keys.' }),
    ApiQuery({ name: 'campus_type', required: false, type: String, description: '[DEPRECATED] Use `university_type` instead. This param has no effect and will be removed in a future release.' }),
    ApiQuery({ name: 'partner_university', required: false, type: Boolean, description: 'When true, only campuses where is_partner is true are returned.' }),
    ApiQuery({ name: 'city', required: false, type: String, description: 'Filter by city name (case-insensitive regex match)' }),
    ApiQuery({ name: 'state', required: false, type: String, description: 'Filter by state/province name' }),
    ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country name' }),
    ApiQuery({ name: 'area', required: false, type: String, description: 'General area search (searches across city/state/country/address_line_1)' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiResponse({
      status: 200,
      description: 'Paginated campuses with optional favorite status for authenticated users',
      schema: {
        example: {
          data: [{
            _id: '651234abcd5678ef9012c001',
            name: 'Main Campus',
            address_id: {
              city: 'Karachi',
              state: 'Sindh',
              country: 'Pakistan'
            },
            university_id: {
              name: 'University Name',
              ranking: 'Top 10',
              accreditations: 'HEC Approved'
            },
            isFavorite: false
          }],
          meta: { total: 1, page: 1, limit: 10, pages: 1 },
        },
      },
    }),
  );
}


