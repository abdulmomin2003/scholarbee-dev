import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function MigratePreferencesApiDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Migrate application preferences from Program IDs to AdmissionProgram IDs',
      description:
        'Migrates all application preference programs from Program collection IDs to their corresponding latest AdmissionProgram IDs. This is a one-time migration operation.',
    }),
    ApiResponse({
      status: 200,
      description: 'Migration completed successfully',
      schema: {
        type: 'object',
        properties: {
          totalApplicationsProcessed: { type: 'number' },
          applicationsUpdated: { type: 'number' },
          applicationsSkipped: { type: 'number' },
          applicationsWithErrors: { type: 'number' },
          totalPreferenceProgramIds: { type: 'number' },
          programIdsToMigrate: { type: 'number' },
          programsWithAdmissionPrograms: { type: 'number' },
          programsWithoutAdmissionPrograms: { type: 'number' },
          remainingProgramIds: { type: 'number' },
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                applicationId: { type: 'string' },
                updated: { type: 'boolean' },
                skipped: { type: 'boolean' },
                error: { type: 'string', nullable: true },
                departmentsUpdated: { type: 'number' },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Migration failed',
    }),
  );
}

