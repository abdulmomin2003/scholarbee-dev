import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiForbiddenResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function GetMyUniversityApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Get my university',
            description: 'Get the university details for the authenticated campus admin. Returns the university associated with the user\'s campus.'
        }),
        ApiResponse({
            status: 200,
            description: 'University document for the authenticated user',
            schema: {
                example: {
                    _id: '651234abcd5678ef9012u001',
                    name: 'Lahore University of Management Sciences',
                    founded: '1984-01-01T00:00:00.000Z',
                    website: 'https://www.lums.edu.pk',
                    address_id: {
                        _id: '651234abcd5678ef9012a001',
                        street: 'Main Boulevard',
                        city: 'Lahore',
                        country: 'Pakistan',
                    },
                },
            },
        }),
        ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
        ApiForbiddenResponse({ description: 'User is not a campus admin' }),
    );
}

