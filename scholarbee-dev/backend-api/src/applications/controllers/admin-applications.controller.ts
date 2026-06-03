import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllowedUserTypes } from 'src/auth/decorators/allowed-user-types.decorator';
import { AllowedUserTypesGuard } from 'src/auth/guards/allowed-user-types.guard';
import { ResourceProtectionGuard } from 'src/auth/guards/resource-protection.guard';
import { UserNS } from 'src/users/schemas/user.schema';
import { BackfillApplicantSnapshotStudentIdApiDoc } from '../api-docs/backfill-applicant-snapshot-student-id.api-doc';
import { FindAllAdminApplicationsApiDoc } from '../api-docs/find-all-admin-applications.api-doc';
import { QueryApplicationDto } from '../dto/query-application.dto';
import { ApplicationsService } from '../services/applications.service';

@ApiTags('admin/applications')
@UseGuards(ResourceProtectionGuard)
@Controller('admin/applications')
export class AdminApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) { }

  /**
   * Dedicated admin listing endpoint for submitted applications.
   *
   * Consumers should migrate to this route from `GET /applications`.
   * It intentionally excludes draft applications.
   */
  @Get()
  @FindAllAdminApplicationsApiDoc()
  findAllSubmitted(@Query() queryDto: QueryApplicationDto) {
    return this.applicationsService.findAllSubmitted(queryDto);
  }

  /**
   * @deprecated One-time migration only. Remove after snapshot student_id is
   * backfilled in all environments.
   */
  @Post('backfill-applicant-snapshot-student-id')
  @UseGuards(AllowedUserTypesGuard)
  @AllowedUserTypes(UserNS.UserType.Super_Admin, UserNS.UserType.Campus_Admin)
  @BackfillApplicantSnapshotStudentIdApiDoc()
  backfillApplicantSnapshotStudentId() {
    return this.applicationsService.backfillApplicantSnapshotStudentIds();
  }
}
