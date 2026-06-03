import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { IsObjectIdPipe } from 'nestjs-object-id';
import { ParseObjectIdPipe } from 'src/common/pipes/object-id.pipe';
import { AuthReq, OptionalAuthReq } from '../../auth/decorators/auth-req.decorator';
import { CampusAdminAuthenticatedRequest } from '../../auth/types/auth.interface';
import { AllowedUserTypes } from '../../auth/decorators/allowed-user-types.decorator';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
import { AllowedUserTypesGuard } from '../../auth/guards/allowed-user-types.guard';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { AuthenticatedRequest, OptionalAuthenticatedRequest } from '../../auth/types/auth.interface';
import { UserNS } from '../../users/schemas/user.schema';
import { CompareProgramsDto } from '../dto/compare-programs.dto';
import { CreateProgramDto } from '../dto/create-program.dto';
import { QueryProgramByCampusDto, QueryProgramDto } from '../dto/query-program.dto';
import { UpdateProgramDto } from '../dto/update-program.dto';
import { ProgramDetailDto } from '../dto/program-detail.dto';
import { ProgramsByCampusResponseDto } from '../dto/programs-by-campus-response.dto';
import { ProgramsService } from '../services/programs.service';
import { QueryCampusAdminProgramsDto } from '../dto/query-campus-admin-programs.dto';
import { CampusAdminProgramsResponseDto } from '../dto/campus-admin-programs-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateProgramApiDoc } from '../api-docs/create-program.api-doc';
import { FindAllProgramsApiDoc } from '../api-docs/find-all-programs.api-doc';
import { GetProgramsStatisticsApiDoc } from '../api-docs/get-statistics-programs.api-doc';
import { GetProgramsCountApiDoc } from '../api-docs/get-count-programs.api-doc';
import { FindProgramsByCampusApiDoc } from '../api-docs/find-by-campus-programs.api-doc';
import { FindAllProgramsByUniversityApiDoc } from '../api-docs/find-by-university-programs.api-doc';
import { FindProgramsByAcademicDepartmentApiDoc } from '../api-docs/find-by-academic-department-programs.api-doc';
import { FindProgramByIdApiDoc } from '../api-docs/find-program-by-id.api-doc';
import { UpdateProgramApiDoc } from '../api-docs/update-program.api-doc';
import { RemoveProgramApiDoc } from '../api-docs/remove-program.api-doc';
import { CompareProgramsApiDoc } from '../api-docs/compare-programs.api-doc';
import { FindCampusAdminProgramsApiDoc } from '../api-docs/find-campus-admin-programs.api-doc';
import { FindProgramBySlugApiDoc } from 'src/programs/api-docs/find-program-by-slug.api-doc';
import { GetProgramDetailApiDoc } from '../api-docs/get-program-detail.api-doc';

@ApiTags('programs')
@Controller('programs')
export class ProgramsController {
  constructor(
    private readonly programsService: ProgramsService,
  ) { }

  /**
   * Create a new program
   * 
   * @description
   * Allows Campus Admins to create a new program for their campus.
   * The campus_id is automatically set from the authenticated user's context.
   * 
   * @access Campus_Admin only
   * @returns The created program document
   * 
   * @usedBy
   * - University Portal: Campus admins creating new programs for their campus
   */
  @UseGuards(ResourceProtectionGuard, AllowedUserTypesGuard)
  @AllowedUserTypes(UserNS.UserType.Campus_Admin)
  @CreateProgramApiDoc()
  @Post()
  create(
    @Body() createProgramDto: CreateProgramDto,
    @AuthReq(UserNS.UserType.Campus_Admin) authReq: CampusAdminAuthenticatedRequest,
  ) {
    return this.programsService.create(createProgramDto, authReq.user);
  }

  /**
   * Get all programs with optional filtering and pagination
   * 
   * @description
   * Retrieves a paginated list of programs with optional filters (search, degree level, duration, etc.).
   * Tracks search history for authenticated users.
   * 
   * @access Public (optional authentication)
   * @returns Paginated list of programs
   * 
   * @usedBy
   * - Student Portal: `programApi.ts` - `getUniversityPrograms` (filters by university_id)
   * - University Portal: `programsApi.ts` - `getPrograms` (general program listing)
   */
  @FindAllProgramsApiDoc()
  @UseGuards(OptionalAuthGuard)
  @Get()
  async findAll(@Query() queryDto: QueryProgramDto, @OptionalAuthReq() req: OptionalAuthenticatedRequest) {
    if (req.user?.['sub']) {
      await this.programsService.indexProgramSearchHistory(req.user?.['sub'], queryDto);
    }

    const result = await this.programsService.findAll(queryDto);
    return result;
  }

  /**
   * Get program statistics
   * 
   * @description
   * Retrieves aggregate statistics about programs (e.g., total count, by degree level, etc.).
   * 
   * @access Public
   * @returns Program statistics
   */
  @GetProgramsStatisticsApiDoc()
  @Get('statistics')
  getStatistics() {
    return this.programsService.getStatistics();
  }

  /**
   * Get total count of programs
   * 
   * @description
   * Returns the total number of programs in the database (excluding soft-deleted programs).
   * 
   * @access Public
   * @returns Total count of programs
   */
  @GetProgramsCountApiDoc()
  @Get('count')
  getTotalCount() {
    return this.programsService.getTotalCount();
  }

  /**
   * Get programs by campus ID
   * 
   * @description
   * Retrieves programs belonging to a specific campus with optional filtering and pagination.
   * Used by the student portal to display programs for a selected campus.
   * Tracks search history for authenticated users.
   * 
   * @access Public (optional authentication)
   * @param campusId - The campus ID to filter programs by
   * @returns Paginated list of programs for the specified campus
   * 
   * @usedBy
   * - University Portal: Campus admins editing program details for their campus
   */
  @FindProgramsByCampusApiDoc()
  @UseGuards(OptionalAuthGuard)
  @Get('campus/:campusId')
  async findByCampus(
    @Param('campusId', ParseObjectIdPipe) campusId: Types.ObjectId,
    @Query() queryDto: QueryProgramByCampusDto,
    @OptionalAuthReq() req: OptionalAuthenticatedRequest,
  ): Promise<ProgramsByCampusResponseDto> {
    const authUserId = req.user?.['sub'];

    if (authUserId) {
      await this.programsService.indexProgramSearchHistory(authUserId, queryDto);
    }
    const result = await this.programsService.findByCampus(campusId, queryDto);
    return result;
  }

  /**
   * Get programs by university ID
   * 
   * @description
   * Retrieves all programs from all campuses belonging to a specific university.
   * Automatically extracts campus IDs from the university and filters programs accordingly.
   * Tracks search history for authenticated users.
   * 
   * @access Public (optional authentication)
   * @param universityId - The university ID to filter programs by
   * @returns Paginated list of programs from the specified university
   */
  @FindAllProgramsByUniversityApiDoc()
  @UseGuards(OptionalAuthGuard)
  @Get('university/:universityId')
  async findAllByUniversity(
    @Param('universityId', ParseObjectIdPipe) universityId: Types.ObjectId,
    @Query() queryDto: QueryProgramDto,
    @OptionalAuthReq() req: OptionalAuthenticatedRequest,
  ) {
    if (req.user?.['sub']) {
      await this.programsService.indexProgramSearchHistory(req.user?.['sub'], queryDto);
    }
    const result = await this.programsService.findAllByUniversity(
      universityId,
      queryDto,
    );
    return result;
  }

  /**
   * Get programs by academic department ID
   * 
   * @description
   * Retrieves all programs belonging to a specific academic department.
   * 
   * @access Public
   * @param academicDepartmentId - The academic department ID to filter programs by
   * @returns Paginated list of programs from the specified academic department
   */
  @FindProgramsByAcademicDepartmentApiDoc()
  @Get('academic-department/:academicDepartmentId')
  async findByAcademicDepartment(
    @Param('academicDepartmentId', ParseObjectIdPipe)
    academicDepartmentId: Types.ObjectId,
    @Query() queryDto: QueryProgramDto,
  ) {
    const result = await this.programsService.findByAcademicDepartment(
      academicDepartmentId,
      queryDto,
    );
    return result;
  }

  /**
   * Get a single program by ID
   * 
   * @description
   * Retrieves detailed information about a specific program by its ID.
   * Optionally populates related fields (e.g., fee structure).
   * 
   * @access Public
   * @param id - The program ID
   * @param populate - Whether to populate related fields (default: true)
   * @returns The program document
   */
  /**
   * Get detailed information of a specific program
   *
   * @description
   * Retrieves comprehensive details of a specific program by campus slug and program template SEO title key.
   * Returns program information along with associated campus and university details, fee structure, and intake periods.
   * This endpoint is useful for students researching a specific program at a specific campus.
   *
   * @access Public (optional authentication)
   * @returns Detailed program information with campus and university details
   *
   * @usedBy
   * - Student Portal: Program detail page, university detail page
   */
  @GetProgramDetailApiDoc()
  @Get('detail-list')
  async getProgramDetail(@Query() queryDto: ProgramDetailDto) {
    return this.programsService.getDetailBySlug(
      queryDto.campus_slug,
      queryDto.seo_title_key,
      queryDto.city,
      queryDto.degree_level,
      queryDto.page,
      queryDto.limit,
    );
  }

  @FindProgramByIdApiDoc()
  @Get(':id')
  async findById(
    @Param('id', ParseObjectIdPipe)
    id: Types.ObjectId,
    @Query('populate') populate: boolean = true,
  ) {
    const result = await this.programsService.findOne(id, populate);
    return result;
  }

  // TODO: Slug version
  /**
   * Get a single program by slug
   *
   * @description
   * Retrieves detailed information about a specific program by its slug.
   * Optionally populates related fields (e.g., fee structure).
   *
   * @access Public
   * @param slug - The program slug
   * @param populate - Whether to populate related fields (default: true)
   * @returns The program document
   */
  @FindProgramBySlugApiDoc()
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('populate') populate: boolean = true,
  ) {
    const result = await this.programsService.findBySlug(slug, populate);
    return result;
  }

  /**
   * Update a program
   * 
   * @description
   * Allows Campus Admins to update an existing program.
   * Validates that the program belongs to the campus admin's campus before allowing the update.
   * 
   * @access Campus_Admin only
   * @param programId - The program ID to update
   * @returns The updated program document
   * @throws ForbiddenException if the program doesn't belong to the campus admin's campus
   * 
   * @usedBy
   * - University Portal: Campus admins editing program details for their campus
   */
  @UseGuards(ResourceProtectionGuard, AllowedUserTypesGuard)
  @AllowedUserTypes(UserNS.UserType.Campus_Admin)
  @UpdateProgramApiDoc()
  @Patch(':id')
  async update(
    @Param('id', ParseObjectIdPipe) programId: Types.ObjectId,
    @Body() updateProgramDto: UpdateProgramDto,
    @AuthReq(UserNS.UserType.Campus_Admin) authReq: CampusAdminAuthenticatedRequest,
  ) {
    // Check if program belongs to the campus admin's campus
    // authReq.user.campus_id is guaranteed to exist due to CampusAdminAuthenticatedRequest type
    await this.programsService.checkProgramCampusAccess(
      programId,
      authReq.user.campus_id,
    );
    return this.programsService.update(programId, updateProgramDto, authReq.user);
  }

  /**
   * Soft delete a program
   *
   * @description
   * Allows Campus Admins to soft delete a program (marks as deleted without removing from database).
   * Validates that the program belongs to the campus admin's campus before allowing deletion.
   * Prevents deletion if there are active or upcoming admission programs associated with the program.
   *
   * @access Campus_Admin only
   * @param programId - The program ID to soft delete
   * @returns Soft deletion confirmation
   * @throws ForbiddenException if the program doesn't belong to the campus admin's campus or has active/upcoming admission programs
   *
   * @usedBy
   * - University Portal: Campus admins removing programs from their campus (Program Management section)
   */
  @UseGuards(ResourceProtectionGuard, AllowedUserTypesGuard)
  @AllowedUserTypes(UserNS.UserType.Campus_Admin)
  @RemoveProgramApiDoc()
  @Delete(':id')
  async remove(
    @Param('id', IsObjectIdPipe) programId: string,
    @AuthReq(UserNS.UserType.Campus_Admin) authReq: CampusAdminAuthenticatedRequest,
  ) {
    // Check if program belongs to the campus admin's campus
    // authReq.user.campus_id is guaranteed to exist due to CampusAdminAuthenticatedRequest type
    await this.programsService.checkProgramCampusAccess(
      programId,
      authReq.user.campus_id,
    );
    return this.programsService.softDelete(programId, authReq.user);
  }

  /**
   * Compare multiple programs
   * 
   * @description
   * Compares multiple programs side-by-side, returning detailed information
   * for each program to facilitate comparison (e.g., fees, duration, requirements).
   * 
   * @access Public
   * @param compareProgramsDto - Array of program IDs to compare
   * @returns Comparison data for the specified programs
   * 
   * @usedBy
   * - Student Portal: `/programs/compare-universities` page - compare universities feature
   */
  @CompareProgramsApiDoc()
  @Post('compare')
  comparePrograms(@Body() compareProgramsDto: CompareProgramsDto) {
    return this.programsService.comparePrograms(compareProgramsDto);
  }

  /**
   * Get programs for campus admin dashboard
   *
   * @description
   * Retrieves programs for the authenticated campus admin with program status information.
   * This API is specifically designed for the Program Management section in the University Portal.
   * Supports filtering by program status (All, Live, On Hold, Deleted) and search by program name or department.
   * Returns programs with columns: Program Name, Department, Duration, Credit Hours, Mode of Study, Status.
   * Status can be: live (active admissions), on_hold (upcoming admissions), or deleted (soft-deleted programs).
   *
   * @access Campus_Admin only - This endpoint is exclusively accessible by campus administrators
   * @returns Paginated list of programs with program status for campus admin dashboard
   *
   * @usedBy
   * - University Portal: Program Management section - Campus admin programs dashboard/table view
   */
  @UseGuards(ResourceProtectionGuard, AllowedUserTypesGuard)
  @AllowedUserTypes(UserNS.UserType.Campus_Admin)
  @FindCampusAdminProgramsApiDoc()
  @Get('campus-admin/dashboard')
  async getCampusAdminPrograms(
    @Query() queryDto: QueryCampusAdminProgramsDto,
    @AuthReq(UserNS.UserType.Campus_Admin) authReq: CampusAdminAuthenticatedRequest,
  ): Promise<CampusAdminProgramsResponseDto> {
    // authReq.user.campus_id is guaranteed to exist due to CampusAdminAuthenticatedRequest type
    return this.programsService.findCampusAdminPrograms(
      authReq.user.campus_id,
      queryDto,
    );
  }

}