import { applyDecorators } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
} from '@nestjs/swagger';

export function GetMyReferralsApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Get all referral codes for authenticated user',
            description:
                'Returns all referral codes created by the authenticated user. This includes both invitation and promo type referral codes. The results are ordered by creation date (newest first). This endpoint is useful for users to view and manage all their referral codes in one place.',
        }),
        ApiResponse({
            status: 200,
            description: 'List of referral codes created by the authenticated user',
            schema: {
                example: [
                    {
                        _id: '507f1f77bcf86cd799439011',
                        code: 'hussnain50',
                        title: 'Hussnain Referral',
                        type: 'invitation',
                        owner_id: '507f1f77bcf86cd799439012',
                        created_at: '2024-01-01T00:00:00.000Z',
                        updated_at: '2024-01-01T00:00:00.000Z',
                    },
                    {
                        _id: '507f1f77bcf86cd799439013',
                        code: 'PROMO2024',
                        title: '2024 Promotional Campaign',
                        type: 'promo',
                        owner_id: '507f1f77bcf86cd799439012',
                        created_at: '2024-01-15T00:00:00.000Z',
                        updated_at: '2024-01-15T00:00:00.000Z',
                    },
                ],
            },
        }),
        ApiResponse({
            status: 200,
            description: 'Empty array returned if user has not created any referral codes yet',
            schema: {
                example: [],
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

