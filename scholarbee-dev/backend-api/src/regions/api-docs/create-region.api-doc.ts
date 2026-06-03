import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateRegionDto } from '../dto/create-region.dto';

export function CreateRegionApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create region (admin)', description: 'Create a new region. Requires admin authentication.' }),
    ApiBody({
      type: CreateRegionDto,
      examples: {
        default: {
          value: {
            region_name: 'Punjab',
            country: 'Pakistan',
            cities: ['Lahore', 'Faisalabad', 'Multan', 'Rawalpindi'],
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Region created', schema: { example: { _id: '651234abcd5678ef9012r001', region_name: 'Punjab', country: 'Pakistan' } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

