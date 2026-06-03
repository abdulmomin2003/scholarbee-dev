import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateAddressDto } from '../dto/create-address.dto';

export function CreateAddressApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Create address', description: 'Create a new address. Requires authentication.' }),
        ApiBody({
            type: CreateAddressDto,
            description: 'Address payload',
            examples: {
                default: {
                    value: {
                        address_line_1: '221B Baker Street',
                        address_line_2: 'Flat B',
                        city: 'London',
                        state: 'Greater London',
                        country: 'UK',
                        postal_code: 'NW1 6XE',
                        latitude: 51.523767,
                        longitude: -0.1585557,
                    },
                },
            },
        }),
        ApiResponse({
            status: 201,
            description: 'Address created',
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
                    updatedAt: '2025-01-01T12:00:00.000Z',
                    __v: 0,
                },
            },
        }),
        ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
    );
}


