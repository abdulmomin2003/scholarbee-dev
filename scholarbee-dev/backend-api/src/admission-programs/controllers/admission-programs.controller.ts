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
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { CreateAdmissionProgramDto } from '../dto/create-admission-program.dto';
import { FilterAdmissionProgramDto } from '../dto/filter-admission-program.dto';
import { QueryAdmissionProgramDto } from '../dto/query-admission-program.dto';
import { UpdateAdmissionProgramDto } from '../dto/update-admission-program.dto';
import { AdmissionProgramsService } from '../services/admission-programs.service';
import { QueryAdmissionProgramDegreeLevelsDto } from '../dto/query-admission-program-degree-levels.dto';
import { QueryAdmissionProgramMajorsDto } from '../dto/query-admission-program-majors.dto';
import {
  AuthReq,
  OptionalAuthReq,
} from 'src/auth/decorators/auth-req.decorator';
import {
  AuthenticatedRequest,
  OptionalAuthenticatedRequest,
} from 'src/auth/types/auth.interface';
import { QueryAdmissionProgramByIdDto } from '../dto/query-admission-program.dto';
import { ParseObjectIdPipe } from 'src/common/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { GetAdmissionProgramsByAcademicDepartmentDto } from '../dto/get-admission-programs-by-academic-department.dto';
import {
  ApiTags,
} from '@nestjs/swagger';
import { UnfavoriteAdmissionProgramApiDocs } from '../api-docs/unfavorite.api-doc';
import { favoriteAdmissionProgramApiDocs } from '../api-docs/favorite.api-doc';
import { deleteAdmissionProgramApiDocs } from '../api-docs/delete.api-doc';
import { updateAdmissionProgramApiDocs } from '../api-docs/update.api-doc';
import { GetAdmissionProgramByIdApiDocs } from '../api-docs/get-admission-program-by-id.api-doc';
import { FindWithFiltersAdmissionProgramApiDocs } from '../api-docs/find-with-filters.api-doc';
import { getUserFavoriteAdmissionProgramApiDocs } from '../api-docs/get-user-favorite.api-doc';
import { getWithOptionalFiltersAdmissionProgramApiDocs } from '../api-docs/get-with-optional-filters.api-doc';
import { getMajorsAdmissionProgramApiDocs } from '../api-docs/get-majors.api-doc';
import { getDegreeLevelsAdmissionProgramApiDocs } from '../api-docs/get-degree-levels..api-doc';
import { CreateAdmissionProgramApiDocs } from '../api-docs/create.api-doc';
import { GetAdmissionProgramsByAcademicDepartmentApiDocs } from '../api-docs/get-admission-programs-by-academic-department.api-doc';
import { GetAdmissionProgramsCountApiDoc } from '../api-docs/get-count-admission-programs.api-doc';
import { IsExternalApplicationAllowedForAdmissionProgramApiDocs } from '../api-docs/is-external-application-allowed-for-admission-program.api-doc';
import { GetAdmissionProgramBySlugApiDocs } from 'src/admission-programs/api-docs/get-admission-program-by-slug.api-doc';
import { AdmissionProgramDetailListQueryDto } from '../dto/admission-program-detail-list-query.dto';
import { GetAdmissionProgramDetailListApiDocs } from '../api-docs/get-admission-program-detail-list.api-doc';


@ApiTags('admission programs -> ✅ (Verified)')
@Controller('admission-programs')
export class AdmissionProgramsController {
  constructor(
    private readonly admissionProgramsService: AdmissionProgramsService,
  ) { }

  @CreateAdmissionProgramApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Post()
  create(
    @Body() createAdmissionProgramDto: CreateAdmissionProgramDto,
    @Req() req,
  ) {
    return this.admissionProgramsService.create(
      createAdmissionProgramDto,
      req.user.sub,
    );
  }

  @getDegreeLevelsAdmissionProgramApiDocs()
  @Get([
    'lookup/degree-levels',
    // @deprecated use lookup/degree-levels instead of degree-levels
    'degree-levels',
  ])
  findAllDegreeLevels(
    @Query()
    queryAdmissionProgramDegreeLevelsDto: QueryAdmissionProgramDegreeLevelsDto,
  ) {
    return this.admissionProgramsService.findAllDegreeLevels(
      queryAdmissionProgramDegreeLevelsDto,
    );
  }


  // @deprecated use lookup/fields-of-study instead
  @getMajorsAdmissionProgramApiDocs()
  @Get('majors')
  findAllMajors(
    @Query() queryAdmissionProgramMajorsDto: QueryAdmissionProgramMajorsDto,
  ) {
    return this.admissionProgramsService.findAllMajors(
      queryAdmissionProgramMajorsDto,
    );
  }

  @GetAdmissionProgramDetailListApiDocs()
  @Get('detail-list')
  getDetailList(
    @OptionalAuthReq() authReq: OptionalAuthenticatedRequest,
    @Query() queryDto: AdmissionProgramDetailListQueryDto,
  ) {
    return this.admissionProgramsService.getDetailList(authReq.user, queryDto);
  }

  @getWithOptionalFiltersAdmissionProgramApiDocs()
  @Get()
  findAll(@Query() queryDto: QueryAdmissionProgramDto) {
    return this.admissionProgramsService.findAll(queryDto);
  }

  @IsExternalApplicationAllowedForAdmissionProgramApiDocs()
  @Get(':admission_program_id/is-external-application-allowed')
  async isExternalApplicationAllowed(@Param('admission_program_id', ParseObjectIdPipe) admission_program_id: Types.ObjectId) {
    return this.admissionProgramsService.isExternalApplicationAllowedForAdmissionProgram(admission_program_id);
  }


  /**
   * Get total count of admission programs
   * 
   * @description
   * Returns the total number of admission programs in the database.
   * 
   * @access Public
   * @returns Total count of admission programs
   */
  @GetAdmissionProgramsCountApiDoc()
  @Get('count')
  getTotalCount() {
    return this.admissionProgramsService.getTotalCount();
  }

  @getUserFavoriteAdmissionProgramApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Get('user/favorites')
  findFavorites(@Req() req, @Query() queryDto: QueryAdmissionProgramDto) {
    return this.admissionProgramsService.findFavorites(req.user.sub, queryDto);
  }

  @FindWithFiltersAdmissionProgramApiDocs()
  @UseGuards(OptionalAuthGuard)
  @Get('with-filters')
  async findWithFilters(
    @Query() filterDto: FilterAdmissionProgramDto,
    @OptionalAuthReq() req: OptionalAuthenticatedRequest,
  ) {
    await this.admissionProgramsService.indexAdmissionProgramSearchHistory(
      req.user?.sub,
      filterDto,
    );

    // Use the new Elasticsearch-based v2 service method
    // Comment out the old MongoDB-based method for now
    // const result = await this.admissionProgramsService.findWithFilters(filterDto);

    // Use the new v2 method with Elasticsearch
    // Pass the user ID to check favorite status
    const userId = req.user?.['sub'];
    const result = await this.admissionProgramsService.findWithFiltersV2(
      filterDto,
      userId,
    );

    return result;
  }

  @GetAdmissionProgramsByAcademicDepartmentApiDocs()
  @Get('lookup/academic-department/:academic_department_id')
  getAdmissionProgramsByAcademicDepartment(
    @Param('academic_department_id', ParseObjectIdPipe) academic_department_id: Types.ObjectId,
  ) {
    return this.admissionProgramsService.getAdmissionProgramsByAcademicDepartment(
      academic_department_id,
    );
  }

  @GetAdmissionProgramByIdApiDocs()
  @Get(':admission_program_id')
  findById(
    @OptionalAuthReq() authReq: OptionalAuthenticatedRequest,
    @Param('admission_program_id') admission_program_id: string,
  ) {
    return this.admissionProgramsService.findById(
      authReq.user,
      admission_program_id,
    );
  }

  @GetAdmissionProgramBySlugApiDocs()
  @Get('slug/:slug')
  findBySlug(
    @OptionalAuthReq() authReq: OptionalAuthenticatedRequest,
    @Param('slug') slug: string,
  ) {
    return this.admissionProgramsService.findBySlug(
      authReq.user,
      slug,
    );
  }

  @updateAdmissionProgramApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdmissionProgramDto: UpdateAdmissionProgramDto,
  ) {
    return this.admissionProgramsService.update(id, updateAdmissionProgramDto);
  }

  @deleteAdmissionProgramApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.admissionProgramsService.remove(id);
  }

  @favoriteAdmissionProgramApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Post(':adm_prg_id/favorites')
  addToFavorites(
    @Param('adm_prg_id', ParseObjectIdPipe) adm_prg_id: Types.ObjectId,
    @Req() req,
  ) {
    return this.admissionProgramsService.addToFavorites(
      adm_prg_id,
      req.user.sub,
    );
  }

  @UnfavoriteAdmissionProgramApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Delete(':adm_prg_id/favorites')
  removeFromFavorites(
    @Param('adm_prg_id', ParseObjectIdPipe) adm_prg_id: Types.ObjectId,
    @AuthReq() req: AuthenticatedRequest,
  ) {
    return this.admissionProgramsService.removeFromFavorites(
      adm_prg_id,
      req.user.sub,
    );
  }
}
