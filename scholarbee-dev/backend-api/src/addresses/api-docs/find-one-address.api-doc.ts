import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function FindOneAddressApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get address by ID' }),
    ApiParam({ name: 'id', required: true, type: String, description: 'Address ID' }),
    ApiResponse({
      status: 200,
      description: 'Address found',
      schema: {
        example: {
          _id: '651234abcd5678ef9012cdef',
          address_line_1: '221B Baker Street',
          address_line_2: 'Flat B',
          city: 'London',
          state: 'Greater London',
          country: 'UK',
          postal_code: 'NW1 6XE',
          latitude: 51.523767,
          longitude: -0.1585557,
          createdBy: '6500aa11bb22cc33dd44ee55',
          createdAt: '2025-01-01T12:00:00.000Z',
          updatedAt: '2025-01-02T08:30:00.000Z',
          __v: 0,
        },
      },
    }),
    ApiNotFoundResponse({ description: 'Address not found' }),
  );
}


