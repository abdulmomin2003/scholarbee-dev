import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function BackfillApplicantSnapshotStudentIdApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '[Deprecated] Backfill applicant_snapshot.student_id on applications',
      deprecated: true,
      description:
        'Scheduled for removal after backfill is complete in all environments. Copies `student_id` from the linked user into `applicant_snapshot` where missing. Requires Super_Admin or Campus_Admin (Admin) user_type.',
    }),
    ApiResponse({
      status: 200,
      description: 'Backfill summary',
      schema: {
        example: {
          matched: 120,
          updated: 118,
          skippedNoUserStudentId: 45,
        },
      },
    }),
  );
}
