import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthReq } from 'src/auth/decorators/auth-req.decorator';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { QueryCampusStatisticsDto } from 'src/campuses/dto/query-campus.dto';
import { ParseObjectIdPipe } from 'src/common/pipes/object-id.pipe';
import { EmailVerifiedGuard } from '../../auth/guards/email-verified.guard';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { CreateApplicationApiDoc } from '../api-docs/create-application.api-doc';
import { FindAllApplicationsApiDoc } from '../api-docs/find-all-applications.api-doc';
import { FindMyApplicationsApiDoc } from '../api-docs/find-my-applications.api-doc';
import { FindOneApplicationApiDoc } from '../api-docs/find-one-application.api-doc';
import { GetCampusStatisticsApiDoc } from '../api-docs/get-campus-statistics.api-doc';
import { GetApplicationLegalRequirementsApiDoc } from '../api-docs/get-legal-requirements.api-doc';
import { GetApplicationStatisticsApiDoc } from '../api-docs/get-statistics.api-doc';
import { RemoveApplicationApiDoc } from '../api-docs/remove-application.api-doc';
import { UpdateApplicationStatusApiDoc } from '../api-docs/update-application-status.api-doc';
import { UpdateApplicationApiDoc } from '../api-docs/update-application.api-doc';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { QueryApplicationDto } from '../dto/query-application.dto';
import {
  UpdateApplicationDto,
  UpdateApplicationStatusDto,
} from '../dto/update-application.dto';
import { ApplicationsService } from '../services/applications.service';

@ApiTags('applications')
@UseGuards(ResourceProtectionGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) { }

  @UseGuards(EmailVerifiedGuard)
  @Post()
  @CreateApplicationApiDoc()
  async create(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.createApplicationDraft(
      authReq.user,
      createApplicationDto,
    );
  }

  /**
   * @deprecated This generic endpoint is being replaced by dedicated
   * consumer-specific endpoints. Student consumers should use
   * `GET /applications/my-applications`, while admin consumers should use
   * `GET /admin/applications`.
   *
   * Transitional behavior: this route now excludes draft applications and
   * relies on `applicant_snapshot` (no user lookup population).
   */
  @Get()
  @FindAllApplicationsApiDoc()
  findAll(@Query() queryDto: QueryApplicationDto) {
    return this.applicationsService.findAllSubmitted(queryDto);
  }

  @Get('my-applications')
  @FindMyApplicationsApiDoc()
  findMyApplications(@Req() req, @Query() queryDto: QueryApplicationDto) {
    return this.applicationsService.findByApplicant(req.user.sub, queryDto);
  }

  @Get('statistics')
  @GetApplicationStatisticsApiDoc()
  getStatistics() {
    return this.applicationsService.getApplicationStatistics();
  }

  @Get('campus-statistics/:campusId')
  @GetCampusStatisticsApiDoc()
  getCampusStatistics(
    @Param('campusId', ParseObjectIdPipe) campusId: Types.ObjectId,
    @Query() query: QueryCampusStatisticsDto,
  ) {
    return this.applicationsService.getCampusStatistics(campusId, query);
  }

  @Get('legal-document-requirements')
  @GetApplicationLegalRequirementsApiDoc()
  async getApplicationLegalRequirements() {
    return this.applicationsService.getApplicationLegalDocuments();
  }

  @Get(':applicationId')
  @FindOneApplicationApiDoc()
  findOne(
    @Param('applicationId', ParseObjectIdPipe) applicationId: Types.ObjectId,
    @Query('populate') populate: boolean = true,
  ) {
    return this.applicationsService.findOne(applicationId, populate);
  }

  @UseGuards(EmailVerifiedGuard)
  @Patch(':applicationId')
  @UpdateApplicationApiDoc()
  update(
    @Param('applicationId', ParseObjectIdPipe) applicationId: Types.ObjectId,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @AuthReq() authReq: AuthenticatedRequest,
  ) {
    return this.applicationsService.update(
      applicationId,
      updateApplicationDto,
      authReq.user,
    );
  }

  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN, Role.CAMPUS_ADMIN)
  @Patch(':applicationId/status')
  @UpdateApplicationStatusApiDoc()
  updateStatus(
    @Param('applicationId', ParseObjectIdPipe) applicationId: Types.ObjectId,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(
      applicationId,
      updateApplicationStatusDto.status,
    );
  }

  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN, Role.CAMPUS_ADMIN)
  @Delete(':applicationId')
  @RemoveApplicationApiDoc()
  remove(
    @Param('applicationId', ParseObjectIdPipe) applicationId: Types.ObjectId,
  ) {
    return this.applicationsService.remove(applicationId);
  }

}
