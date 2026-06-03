import { applyDecorators } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiNotFoundResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';

export function FindReferralByCodeApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Find referral by code',
            description:
                'Retrieves a referral code by its unique code string. This endpoint is useful for validating referral codes before signup, checking if a referral code exists, or retrieving referral details. The code is case-sensitive and must match exactly. This endpoint can be used by any authenticated user to check referral code validity.',
        }),
        ApiParam({
            name: 'code',
            required: true,
            type: String,
            description: 'The referral code to search for. Must be a valid referral code string with maximum 8 characters. The code is case-sensitive.',
            example: 'hussnain50',
        }),
        ApiResponse({
            status: 200,
            description: 'Referral code found successfully',
            schema: {
                example: {
                    _id: '507f1f77bcf86cd799439011',
                    code: 'hussnain50',
                    title: 'Hussnain Referral',
                    type: 'invitation',
                    owner_id: '507f1f77bcf86cd799439012',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                },
            },
        }),
        ApiNotFoundResponse({
            description: 'Referral code not found. The code may be invalid, expired, or does not exist in the system.',
            schema: {
                example: {
                    message: "Referral code 'hussnain50' not found",
                    error: 'Not Found',
                    statusCode: 404,
                },
            },
        }),
        ApiBadRequestResponse({
            description: 'Invalid referral code format or missing code parameter',
            schema: {
                example: {
                    message: 'Invalid referral code format',
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
            description: 'User does not have permission to access referral codes',
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

