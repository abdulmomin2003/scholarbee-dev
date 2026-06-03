import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateRegionDto } from '../dto/update-region.dto';

export function UpdateRegionApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update region (admin)', description: 'Update region fields by ID. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      type: UpdateRegionDto,
      examples: {
        default: {
          value: {
            region_name: 'Punjab (Updated)',
            cities: ['Lahore', 'Faisalabad', 'Multan', 'Rawalpindi', 'Gujranwala'],
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated region', schema: { example: { _id: '651234abcd5678ef9012r001', region_name: 'Punjab (Updated)' } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

