import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateAddressDto } from '../dto/update-address.dto';

export function UpdateAddressApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update address', description: 'Update one or more fields of an address by ID. Requires authentication.' }),
    ApiParam({ name: 'addressId', required: true, type: String, description: 'Address ID' }),
    ApiBody({
      type: UpdateAddressDto,
      description: 'Fields to update',
      examples: {
        default: {
          value: {
            address_line_2: 'Suite 300',
            postal_code: 'NW1 6XF',
            latitude: 51.5239,
            longitude: -0.1586,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Updated address document',
      schema: {
        example: {
          _id: '651234abcd5678ef9012cdef',
          address_line_1: '221B Baker Street',
          address_line_2: 'Suite 300',
          city: 'London',
          state: 'Greater London',
          country: 'UK',
          postal_code: 'NW1 6XF',
          latitude: 51.5239,
          longitude: -0.1586,
          createdBy: '6500aa11bb22cc33dd44ee55',
          createdAt: '2025-01-01T12:00:00.000Z',
          updatedAt: '2025-01-03T09:15:00.000Z',
          __v: 0,
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}


