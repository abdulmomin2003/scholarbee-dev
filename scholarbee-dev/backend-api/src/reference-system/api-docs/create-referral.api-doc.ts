import { applyDecorators } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateReferralDto } from '../dto/create-referral.dto';

export function CreateReferralApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Create referral code',
            description:
                'Creates a new referral code for the authenticated user. The owner_id is automatically extracted from the JWT token. If the code is not provided, a unique 8-character code will be automatically generated using UUID. Referral codes must be unique across the system. The title must also be unique and will be automatically converted to lowercase. This endpoint is useful for users who want to create their own referral codes to track signups.',
        }),
        ApiBody({
            type: CreateReferralDto,
            description: 'Referral code creation data',
            examples: {
                invitation: {
                    summary: 'Create invitation referral code with custom code',
                    description: 'Example of creating an invitation-type referral code with a custom code. Note: The title will be automatically converted to lowercase.',
                    value: {
                        code: 'husnain1',
                        title: 'hussnain referral',
                        type: 'invitation',
                    },
                },
                invitationAutoCode: {
                    summary: 'Create invitation referral code with auto-generated code',
                    description: 'Example of creating an invitation-type referral code without providing a code. A unique 8-character code will be automatically generated. Note: The title will be automatically converted to lowercase.',
                    value: {
                        title: 'hussnain referral',
                        type: 'invitation',
                    },
                },
                promo: {
                    summary: 'Create promotional referral code',
                    description: 'Example of creating a promotional-type referral code. Note: The title will be automatically converted to lowercase.',
                    value: {
                        code: 'PROM2024',
                        title: '2024 promotional campaign',
                        type: 'promo',
                    },
                },
                promoAutoCode: {
                    summary: 'Create promotional referral code with auto-generated code',
                    description: 'Example of creating a promotional-type referral code without providing a code. A unique 8-character code will be automatically generated.',
                    value: {
                        title: '2024 promotional campaign',
                        type: 'promo',
                    },
                },
            },
        }),
        ApiResponse({
            status: 201,
            description: 'Referral code created successfully',
            schema: {
                example: {
                    _id: '507f1f77bcf86cd799439011',
                    code: 'husnain1',
                    title: 'hussnain referral',
                    type: 'invitation',
                    owner_id: '507f1f77bcf86cd799439012',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                },
            },
        }),
        ApiResponse({
            status: 409,
            description: 'Referral code or title already exists',
            schema: {
                example: {
                    message: "Referral code 'hussnain50' already exists",
                    error: 'Conflict',
                    statusCode: 409,
                },
            },
        }),
        ApiBadRequestResponse({
            description: 'Invalid input data. Possible reasons: code exceeds 8 characters, invalid referral type, missing required fields',
            schema: {
                example: {
                    message: ['code must be shorter than or equal to 8 characters'],
                    error: 'Bad Request',
                    statusCode: 400,
                },
            },
        }),
        ApiUnauthorizedResponse({
            description: 'Missing or invalid authentication token',
            schema: {
                example: {
                    message: 'Unauthorized',
                    statusCode: 401,
                },
            },
        }),
        ApiForbiddenResponse({
            description: 'User does not have permission to create referral codes',
            schema: {
                example: {
                    message: 'Forbidden resource',
                    error: 'Forbidden',
                    statusCode: 403,
                },
            },
        }),
    );
}

