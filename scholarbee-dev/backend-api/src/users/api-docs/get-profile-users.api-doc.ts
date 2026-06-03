import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function GetProfileUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Get current user profile',
            description: [
                'Returns the sanitized profile of the authenticated user.',
                '',
                '**Onboarding status:** The presence of the `onboarding_preferences` object indicates whether the user has completed the onboarding flow.',
                'If the field is `null` or absent, the user has not yet gone through onboarding and should be redirected to the onboarding screen.',
                'If the field is a non-null object, onboarding is complete and the stored preferences can be used to personalise the experience.',
            ].join('\n'),
        }),
        ApiResponse({
            status: 200,
            description: 'Sanitized user profile. `onboarding_preferences` is `null` when the user has not completed onboarding.',
            schema: {
                example: {
                    _id: '507f1f77bcf86cd799439011',
                    email: 'me@example.com',
                    full_name: 'Me User',
                    first_name: 'Me',
                    last_name: 'User',
                    phone_number: '+923001234567',
                    onboarding_preferences: {
                        degree_goal: 'Bachelors',
                        preferred_cities: ['Lahore', 'Islamabad'],
                        preferred_fields_of_study: ['Computer Science'],
                        semester_fee_range: { min: 50000, max: 150000 },
                        previous_marks_range: { min_percent: 70, max_percent: 90 },
                        start_timeline: {
                            type: 'within_6_months',
                            selected_at: '2026-04-25T10:00:00.000Z',
                        },
                        version: 1,
                        updated_at: '2026-04-25T10:00:00.000Z',
                    },
                },
            },
        }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
