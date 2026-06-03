import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function FindAllPartnersApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get partner campuses grouped by university',
            description:
                'Retrieve all primary campuses marked as partners, grouped by their universities. This is a public endpoint for homepage display.',
        }),
        ApiResponse({
            status: 200,
            description: 'List of partner universities with their campuses',
            schema: {
                example: {
                    data: [
                        {
                            university: {
                                _id: '651234abcd5678ef9012u001',
                                name: 'RIPHAH International University',
                                logo_url: 'https://example.com/logos/riphah.png',
                                website: 'https://www.riphah.edu.pk',
                            },
                            campuses: [
                                {
                                    _id: '651234abcd5678ef9012c001',
                                    name: 'RIPHAH Main Campus',
                                    logo_url: 'https://example.com/logos/riphah-campus.png',
                                    website: 'https://www.riphah.edu.pk',
                                },
                            ],
                        },
                        {
                            university: {
                                _id: '651234abcd5678ef9012u002',
                                name: 'FAST University',
                                logo_url: 'https://example.com/logos/fast.png',
                                website: 'https://www.nu.edu.pk',
                            },
                            campuses: [
                                {
                                    _id: '651234abcd5678ef9012c002',
                                    name: 'FAST Islamabad Campus',
                                    logo_url: 'https://example.com/logos/fast-campus.png',
                                    website: 'https://www.nu.edu.pk',
                                },
                            ],
                        },
                    ],
                },
            },
        }),
    );
}

