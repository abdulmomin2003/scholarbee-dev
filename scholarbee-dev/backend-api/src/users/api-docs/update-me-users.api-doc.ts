import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';
import { UPDATE_USER_API_BODY } from './_update-user-body.schema';

export function UpdateMeUsersApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update current user (self)',
      description:
        `Update the authenticated user's own fields. User ID is derived from the bearer token — no :id param required.\n\n` +
        `Partial updates are supported.\n\n` +
        `Onboarding client flow:\n` +
        `1) Load reference options for fields-of-study from GET /program-templates and derive unique non-empty field_of_study values on client.\n` +
        `2) Render onboarding form options (cities/degree/timeline from client constants, fields-of-study from program templates).\n` +
        `3) Submit via PATCH /users/me using either full onboarding_preferences payload or step-wise partial payload.\n` +
        `4) Server merges onboarding_preferences, normalizes timeline/null semantics, and updates onboarding_preferences.updated_at.\n\n` +
        `Semantics:\n` +
        `- Omitted key => no change\n` +
        `- Explicit null => clear/opt-out (where supported)\n` +
        `- Arrays => replace for that key (send [] to clear list)`,
    }),
    ApiBody(UPDATE_USER_API_BODY),
    ApiResponse({
      status: 200,
      description: 'Updated user document',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          email: 'user@example.com',
          full_name: 'Jane Doe',
          onboarding_preferences: {
            degree_goal: 'Masters',
            preferred_cities: ['Islamabad', 'Lahore'],
            preferred_fields_of_study: ['Computer Science'],
            semester_fee_range: { min: 85000, max: 150000 },
            previous_marks_range: { min_percent: 60, max_percent: 80 },
            start_timeline: {
              type: 'within_6_months',
              selected_at: '2026-04-24T10:00:00.000Z',
            },
            version: 1,
            updated_at: '2026-04-24T10:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation error (e.g., invalid range bounds)',
      schema: {
        oneOf: [
          {
            title: 'Invalid fee range',
            example: {
              statusCode: 400,
              message: 'Invalid semester_fee_range: min cannot be greater than max',
            },
          },
          {
            title: 'Invalid marks range',
            example: {
              statusCode: 400,
              message: 'Invalid previous_marks_range: min_percent cannot be greater than max_percent',
            },
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({ description: 'Authentication required' }),
  );
}
