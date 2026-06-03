import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllApplicationsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'List applications',
      description: `
Retrieve a paginated, filtered list of submitted applications.

Deprecated behavior note:
- This generic endpoint is transitional and will be replaced by dedicated consumer-specific endpoints.
- Admin consumers should switch to \`GET /admin/applications\`.
- Draft applications are always excluded.
- Applicant data is served from \`applicant_snapshot\`, so user lookup population is disabled for this endpoint.

For this route, \`search\` matches case-insensitively against:
- \`applicant_snapshot.full_name\`
- \`applicant_snapshot.first_name\`
- \`applicant_snapshot.last_name\`
- \`applicant_snapshot.student_id\`
      `.trim(),
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description:
        'Free-text search term. Matches case-insensitively against applicant_snapshot full_name, first_name, last_name, and student_id.',
      example: 'john',
    }),
    ApiQuery({ name: 'admission_program_id', required: false, type: String, description: 'Filter by admission program ID' }),
    ApiQuery({ name: 'campus_id', required: false, type: String, description: 'Filter by campus ID' }),
    ApiQuery({ name: 'program', required: false, type: String, description: 'Filter by program ID' }),
    ApiQuery({ name: 'admission_id', required: false, type: String, description: 'Filter by admission ID' }),
    ApiQuery({ name: 'applicant_id', required: false, type: String, description: 'Filter by applicant (user) ID' }),
    ApiQuery({ name: 'status', required: false, isArray: true, type: String, description: 'Filter by one or many statuses (e.g. Pending, Approved, Rejected, Under Review). Draft is always excluded.' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, enum: ['asc', 'desc'], example: 'desc' }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: false, description: 'Ignored for this endpoint; applicant data comes from applicant_snapshot and user lookup population is disabled.' }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of submitted applications.',
      schema: {
        example: {
          data: [
            {
              _id: '69784b5409fdcf976bd6b208',
              createdAt: '2026-01-27T05:21:24.443Z',
              updatedAt: '2026-01-27T05:21:24.443Z',
              status: 'Approved',
              submission_date: '2026-01-27T05:21:24.443Z',
              total_processing_fee: 500,
              applicant: '6500aa11bb22cc33dd44ee55',
              applicant_snapshot: {
                full_name: 'John Doe',
                first_name: 'John',
                last_name: 'Doe',
                student_id: 'SB_000000001',
                email: 'john.doe@example.com',
                phone_number: '+92300000000',
              },
              program: '695cd3b36fd5803ca8982888',
              campus_id: '691da6630c3e825b637dcc01',
              admission_id: '6910f2a10c3e825b637dc300',
              admission_program_id: '69677d68319d8c679223045b',
              // ── Departments ──────────────────────────────────────────────────
              departments: [
                {
                  _id: '69784b5409fdcf976bd6b209',
                  created_at: '2026-01-27T05:21:24.443Z',
                  updated_at: '2026-01-27T05:21:24.443Z',
                  department: {
                    _id: '691ef7810c3e825b637dcc3a',
                  },
                  preferences: [
                    {
                      _id: '69784b5409fdcf976bd6b20a',
                      created_at: '2026-01-27T05:21:24.443Z',
                      updated_at: '2026-01-27T05:21:24.443Z',
                      preference_order: '1st',
                      program: '69677d68319d8c679223045b',
                    },
                    {
                      _id: '69784b5409fdcf976bd6b20b',
                      created_at: '2026-01-27T05:21:24.443Z',
                      updated_at: '2026-01-27T05:21:24.443Z',
                      preference_order: '2nd',
                      program: '695cd3b36fd5803ca8982889',
                    },
                  ],
                },
              ],
            },
          ],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      },
    }),
  );
}
