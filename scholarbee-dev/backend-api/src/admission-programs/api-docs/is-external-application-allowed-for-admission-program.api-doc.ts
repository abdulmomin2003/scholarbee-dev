import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

export function IsExternalApplicationAllowedForAdmissionProgramApiDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Check if the program allows external applications',
            description: 'Returns true if external applications are enabled, false if they are disabled.',
        }),
        ApiParam({
            name: 'admission_program_id',
            required: true,
            type: String,
            description: 'Admission program ID (MongoDB ObjectId)',
        }),
        ApiOkResponse({
            description: 'The check was successful.',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            isExternalApplicationAllowed: {
                                type: 'boolean',
                                description: 'True if external application is ENABLED; false if DISABLED.'
                            },
                            university_name: { type: 'string' },
                            university_id: { type: 'string' },
                            redirect_deeplink: {
                                type: 'string',
                                nullable: true,
                                description: 'Present only if isExternalApplicationAllowed is true.'
                            },
                        },
                    },
                    examples: {
                        'Enabled - Application Allowed': {
                            value: {
                                isExternalApplicationAllowed: true,
                                university_name: 'Rashid Latif Khan University',
                                university_id: '692dd9fd0c3e825b637fa452',
                                redirect_deeplink: 'https://uni-portal.com/apply',
                            },
                            summary: 'Scenario: External application is active.',
                        },
                        'Disabled - Application Not Allowed': {
                            value: {
                                isExternalApplicationAllowed: false,
                                university_name: 'Capital University of Science & Technology',
                                university_id: '67740b5d16ee3ee49f87a921',
                            },
                            summary: 'Scenario: External application is turned off.',
                        },
                    },
                },
            },
        }),
    );
}