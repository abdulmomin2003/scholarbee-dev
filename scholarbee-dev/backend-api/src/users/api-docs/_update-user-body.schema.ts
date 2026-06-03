import { UserNS } from '../schemas/user.namespace';

/**
 * Shared ApiBody arguments (schema + examples) for the update-user endpoints.
 * Imported by both update-user-users.api-doc.ts and update-me-users.api-doc.ts
 * to keep them in sync.
 */
export const UPDATE_USER_API_BODY = {
  description:
    `User fields to update. Supports both full and partial onboarding_preferences payloads.\n\n` +
    `Onboarding field coverage in examples below:\n` +
    `- degree_goal (set + clear)\n` +
    `- preferred_cities (set + clear)\n` +
    `- preferred_fields_of_study (set + clear)\n` +
    `- semester_fee_range (bounded + open-ended + clear)\n` +
    `- previous_marks_range (bounded + opt-out)\n` +
    `- start_timeline (immediate / within_6_months / next_year / null)\n` +
    `- mixed payload (onboarding + non-onboarding user fields)`,
  schema: {
    type: 'object',
    properties: {
      // ── Profile ──────────────────────────────────────────────────────────
      full_name: {
        type: 'string',
        description: 'Preferred display name.',
      },
      gender: {
        type: 'string',
        enum: ['Male', 'Female', 'Other'],
      },
      date_of_birth: {
        type: 'string',
        format: 'date-time',
      },
      nationality: { type: 'string' },
      religion: { type: 'string' },
      special_person: {
        type: 'string',
        enum: ['yes', 'no'],
      },
      phone_number: { type: 'string' },
      profile_image_url: {
        type: 'string',
        format: 'uri',
      },
      current_stage: {
        type: 'integer',
        minimum: 0,
        maximum: 5,
        description: '0=signup 1=profile 2=academic 3=financial 4=document 5=complete',
      },
      isProfileCompleted: { type: 'boolean' },

      // ── Parental info ─────────────────────────────────────────────────────
      father_name: { type: 'string' },
      father_profession: { type: 'string' },
      father_status: {
        type: 'string',
        enum: ['alive', 'deceased'],
      },
      father_income: {
        type: 'string',
        pattern: '^\\d{1,12}$',
        nullable: true,
        description: 'Numeric string, max 12 digits. null to clear.',
      },
      fatherEmailAddress: { type: 'string', format: 'email' },
      fatherPhoneNumber: { type: 'string' },
      mother_name: { type: 'string' },
      mother_profession: { type: 'string' },
      mother_status: {
        type: 'string',
        enum: ['alive', 'deceased'],
      },
      mother_income: {
        type: 'string',
        pattern: '^\\d{1,12}$',
        nullable: true,
        description: 'Numeric string, max 12 digits. null to clear.',
      },

      // ── Address ───────────────────────────────────────────────────────────
      provinceOfDomicile: {
        type: 'string',
        enum: Object.values(UserNS.ProvinceOfDomicile),
      },
      districtOfDomicile: { type: 'string' },
      stateOrProvince: { type: 'string' },
      city: { type: 'string' },
      postalCode: { type: 'string' },
      streetAddress: { type: 'string' },

      // ── Onboarding preferences ────────────────────────────────────────────
      onboarding_preferences: {
        type: 'object',
        description:
          'Partial updates are merged onto existing preferences. ' +
          'Omitted keys are left unchanged. Arrays replace the stored array entirely.',
        properties: {
          degree_goal: {
            nullable: true,
            description: 'null = cleared / opted-out.',
            enum: [...Object.values(UserNS.OnboardingDegreeGoal), null],
          },
          preferred_cities: {
            type: 'array',
            items: { type: 'string' },
            description: 'Free-text city names. Send [] to clear.',
          },
          preferred_fields_of_study: {
            type: 'array',
            items: { type: 'string' },
            description: 'Free-text field-of-study names. Send [] to clear.',
          },
          semester_fee_range: {
            type: 'object',
            nullable: true,
            description:
              'Affordability range in PKR per semester. ' +
              'Replaces stored value entirely. ' +
              'Send null to clear (stored as {min: null, max: null}). ' +
              'Omit a bound to leave it unset (open-ended). ' +
              'max must be >= min when both are provided.',
            properties: {
              min: {
                type: 'number',
                minimum: 0,
                nullable: true,
                description: 'Inclusive lower bound (PKR/semester).',
              },
              max: {
                type: 'number',
                minimum: 0,
                nullable: true,
                description: 'Inclusive upper bound (PKR/semester). Must be >= min.',
              },
            },
          },
          previous_marks_range: {
            type: 'object',
            nullable: true,
            description:
              'Previous academic marks percentage range (0–100). ' +
              'Replaces stored value entirely. ' +
              'Send null to opt-out — cannot be reversed once marks have been set. ' +
              'max_percent must be >= min_percent when both are provided.',
            properties: {
              min_percent: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                nullable: true,
              },
              max_percent: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                nullable: true,
                description: 'Must be >= min_percent.',
              },
            },
          },
          start_timeline: {
            type: 'object',
            description: 'When the user plans to enrol.',
            properties: {
              type: {
                nullable: true,
                description:
                  'null = "just exploring" / no committed timeline. ' +
                  'selected_at is auto-set by the server when type changes and is omitted.',
                enum: [...Object.values(UserNS.OnboardingStartTimelineType), null],
              },
              selected_at: {
                type: 'string',
                format: 'date-time',
                description:
                  'Timestamp of when this timeline was chosen. ' +
                  'Server auto-sets to now when type changes and this field is omitted.',
              },
            },
          },
          version: {
            type: 'integer',
            minimum: 1,
            description: 'Questionnaire schema version for forward-compatible migrations.',
          },
        },
      },
    },
  },
  examples: {
    'Scenario A: Full Onboarding Submit (All Fields)': {
      value: {
        onboarding_preferences: {
          degree_goal: 'Masters',
          preferred_cities: ['Islamabad', 'Lahore'],
          preferred_fields_of_study: [
            'Computer Science',
            'Business Administration',
          ],
          semester_fee_range: { min: 85000, max: 150000 },
          previous_marks_range: { min_percent: 60, max_percent: 80 },
          start_timeline: {
            type: 'within_6_months',
            selected_at: '2026-04-24T10:00:00Z',
          },
          version: 1,
        },
      },
    },
    'Scenario B: Step-wise Partial Submit (Single Step)': {
      value: {
        onboarding_preferences: {
          preferred_fields_of_study: ['Computer Science'],
        },
      },
    },
    'Scenario C: Clear Values / Opt-out': {
      value: {
        onboarding_preferences: {
          previous_marks_range: null,
          semester_fee_range: null,
          start_timeline: { type: null },
          preferred_cities: [],
        },
      },
    },
    'Scenario D: Degree Goal Opt-out': {
      value: {
        onboarding_preferences: {
          degree_goal: null,
        },
      },
    },
    'Scenario E: Open-ended Fee Range (Only Max)': {
      value: {
        onboarding_preferences: {
          semester_fee_range: { max: 300000 },
        },
      },
    },
    'Scenario F: Open-ended Fee Range (Only Min)': {
      value: {
        onboarding_preferences: {
          semester_fee_range: { min: 300000 },
        },
      },
    },
    'Scenario G: Marks Range (High Scorer)': {
      value: {
        onboarding_preferences: {
          previous_marks_range: { min_percent: 80, max_percent: 100 },
        },
      },
    },
    'Scenario H: Timeline Immediate (selected_at omitted; server can normalize)': {
      value: {
        onboarding_preferences: {
          start_timeline: { type: 'immediate' },
        },
      },
    },
    'Scenario I: Timeline Next Year': {
      value: {
        onboarding_preferences: {
          start_timeline: {
            type: 'next_year',
            selected_at: '2026-04-24T10:00:00Z',
          },
        },
      },
    },
    'Scenario J: Timeline Within 6 Months': {
      value: {
        onboarding_preferences: {
          start_timeline: {
            type: 'within_6_months',
            selected_at: '2026-04-24T10:00:00Z',
          },
        },
      },
    },
    'Scenario K: Mixed Profile + Onboarding Update': {
      value: {
        full_name: 'Jane Doe',
        gender: 'Female',
        profile_image_url: 'https://cdn.example.com/u/jane.png',
        onboarding_preferences: {
          preferred_cities: ['Karachi', 'Lahore'],
          preferred_fields_of_study: [
            'Computer Science',
            'Electrical Engineering',
          ],
        },
      },
    },
    'Scenario L: Replace Field-of-Study Selection': {
      value: {
        onboarding_preferences: {
          preferred_fields_of_study: ['Law'],
        },
      },
    },
    'Scenario M: Clear Field-of-Study Selection': {
      value: {
        onboarding_preferences: {
          preferred_fields_of_study: [],
        },
      },
    },
  },
} as const;
