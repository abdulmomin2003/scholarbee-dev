import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

export function UpdateOrganizationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update organization (admin)', description: 'Update organization fields by ID. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      type: UpdateOrganizationDto,
      examples: {
        default: {
          value: {
            contact_email: 'updated@moe.gov.pk',
            contact_phone: '+92-51-9876543',
            website_url: 'https://www.updated-moe.gov.pk',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Updated organization',
      schema: {
        example: {
          _id: '651234abcd5678ef9012org1',
          organization_name: 'Ministry of Education',
          contact_email: 'updated@moe.gov.pk',
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

