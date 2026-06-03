import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateOrganizationDto } from '../dto/create-organization.dto';

export function CreateOrganizationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create organization (admin)', description: 'Create a new organization. Requires admin authentication.' }),
    ApiBody({
      type: CreateOrganizationDto,
      examples: {
        default: {
          value: {
            organization_name: 'Ministry of Education',
            organization_type: 'government',
            address: '123 Education Street, Islamabad',
            contact_email: 'contact@moe.gov.pk',
            contact_phone: '+92-51-1234567',
            website_url: 'https://www.moe.gov.pk',
            profile_image_url: 'https://cdn.example.com/org-logo.png',
            country: '651234abcd5678ef9012cnt1',
            region: '651234abcd5678ef9012reg1',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Organization created', schema: { example: { _id: '651234abcd5678ef9012org1', organization_name: 'Ministry of Education' } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

