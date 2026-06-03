import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdmissionSessionEnum } from 'src/admissions/schemas/admission.schema';

export function GetAdmissionProgramDetailListApiDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get admission program details by filter parameters',
      description:
        'Fetches admission programs using a combination of a campus or university slug, city, and either ' +
        '`seo_title_key` (preferred) or the legacy `major` + `degree_level` filters.\n\n' +
        '**Slug resolution:** Provide `campus_slug` (preferred) or the deprecated `university_slug`. ' +
        'When only `university_slug` is supplied it is resolved internally to the matching campus. ' +
        'At least one of the two must be present.\n\n' +
        '**Important:** The `major` field refers to the **field of study** (e.g., "Computer Science", ' +
        '"Electrical Engineering"), NOT the program name (e.g., "BS Computer Science"). ' +
        'For precise lookups, prefer using `seo_title_key` instead.',
    }),
    ApiQuery({
      name: 'campus_slug',
      required: false,
      type: String,
      description:
        'Campus slug to filter by. Preferred replacement for the deprecated `university_slug`. ' +
        'When both are supplied, `campus_slug` takes priority.',
      example: 'nust-main-campus-islamabad',
    }),
    ApiQuery({
      name: 'university_slug',
      required: false,
      type: String,
      deprecated: true,
      description:
        '**Deprecated — use `campus_slug` instead.** ' +
        'University slug to filter by. When provided without `campus_slug`, the slug is resolved ' +
        'internally to the matching campus(es). Support will be removed in a future release.',
      example: 'national-university-of-sciences-and-technology',
    }),
    ApiQuery({
      name: 'city',
      required: true,
      type: String,
      description: 'City name',
      example: 'Islamabad',
    }),
    ApiQuery({
      name: 'degree_level',
      required: false,
      type: String,
      description:
        'Degree level (e.g., Bachelors, Masters, Doctorate, Diploma). Optional when `seo_title_key` is provided.',
      example: 'Bachelors',
    }),
    ApiQuery({
      name: 'seo_title_key',
      required: false,
      type: String,
      description:
        'SEO-friendly title key of the program template for precise lookups. ' +
        'Examples: "bs-computer-science", "bachelor-business-administration", "mba-finance", "ms-data-science".',
      example: 'bs-computer-science',
    }),
    ApiQuery({
      name: 'major',
      required: false,
      type: String,
      deprecated: true,
      description:
        '**Deprecated.** The field of study / discipline (e.g., "Computer Science"). ' +
        'This does NOT refer to the program name. Prefer `seo_title_key` for precise lookups.',
      example: 'Computer Science',
    }),
    ApiQuery({
      name: 'session_term',
      required: false,
      enum: AdmissionSessionEnum,
      description: 'Academic session term to filter by (e.g., fall, spring, summer, winter).',
      example: AdmissionSessionEnum.FALL,
    }),
    ApiQuery({
      name: 'session_year',
      required: false,
      type: Number,
      description: 'Academic session year to filter by (e.g., 2025). Ignored when `only_latest_term_programs` is true.',
      example: 2025,
    }),
    ApiQuery({
      name: 'only_latest_term_programs',
      required: false,
      type: Boolean,
      description:
        'When true, `session_year` is suppressed and the backend automatically returns only records ' +
        'from the most recent available year for the matching program/campus combination. ' +
        'Intended for evergreen frontend URLs that should always resolve to the current admission cycle.',
      example: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Admission programs matching the filters.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            slug: { type: 'string' },
            admission: { type: 'object' },
            program: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Bachelor of Computer Science' },
                short_name: { type: 'string', example: 'BS Computer Science', nullable: true },
                seo_title_key: {
                  type: 'string',
                  example: 'bs-computer-science',
                  nullable: true,
                  deprecated: true,
                  description:
                    '**Deprecated.** Use the top-level `program_template_seo_title` field instead.',
                },
                degree_level: { type: 'string', example: 'Bachelors' },
                major: { type: 'string', example: 'Computer Science' },
                field_of_study: { type: 'string', example: 'Computer Science' },
              },
            },
            fee_structure: { type: 'object' },
            program_template_seo_title: {
              type: 'string',
              example: 'bs-computer-science',
              nullable: true,
              description:
                'SEO-friendly title key sourced directly from the program template. ' +
                'Replaces the deprecated `program.seo_title_key` nested path.',
            },
            was_redirected: {
              type: 'boolean',
              example: false,
              description:
                'Computed per-request. True when the authenticated user was redirected for this admission program.',
            },
            is_already_applied: {
              type: 'boolean',
              example: false,
              description:
                'Computed per-request. True when the authenticated user already has a non-draft internal application for this admission program.',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request — neither campus_slug nor university_slug was provided.',
    }),
    ApiResponse({
      status: 404,
      description: 'No admission program found matching the filters',
    }),
  );
}
