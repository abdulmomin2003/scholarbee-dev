import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { SearchHistoryAnalyticsService } from '../analytics/services/search-history.analytics.service';
import { AuthReq } from '../auth/decorators/auth-req.decorator';
import { OptionalAuthReq } from '../auth/decorators/auth-req.decorator';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { ResourceProtectionGuard } from '../auth/guards/resource-protection.guard';
import { AuthenticatedRequest } from '../auth/types/auth.interface';
import { OptionalAuthenticatedRequest } from '../auth/types/auth.interface';
import {
  ISearchHistoryIndexDoc,
  SearchResourceEnum,
} from '../elasticsearch/mappings/search-history.mapping';
import { UserNS } from '../users/schemas/user.schema';
import { CreateUniversityDto } from './dto/create-university.dto';
import { QueryUniversityDto } from './dto/query-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { UniversitiesService } from './universities.service';
import { ParseObjectIdPipe } from 'src/common/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { CreateUniversityApiDoc } from './api-docs/create-university.api-doc';
import { FindAllUniversitiesApiDoc, FindAllUniversitiesWithAvailableProgramsApiDoc } from './api-docs/find-all-universities.api-doc';
import { FindOneUniversityApiDoc } from './api-docs/find-one-university.api-doc';
import { GetUniversityProfileByIdApiDoc } from './api-docs/get-university-profile-by-id.api-doc';
import { GetUniversityProfileBySlugApiDoc } from './api-docs/get-university-profile-by-slug.api-doc';
import { GetMyUniversityApiDoc } from './api-docs/get-my-university.api-doc';
import { UpdateUniversityApiDoc } from './api-docs/update-university.api-doc';
import { RemoveUniversityApiDoc } from './api-docs/remove-university.api-doc';
import { FindOneUniversityBySlugApiDoc } from 'src/universities/api-docs/find-one-university-by-slug.api-doc';
import { UniversityAccessGuard } from 'src/auth/guards/university-access.guard';
import { UniversityDetailListQueryDto } from './dto/university-detail-list-query.dto';
import { GetUniversityDetailListApiDocs } from './api-docs/get-university-detail-list.api-doc';

@ApiTags('universities')
@Controller('universities')
export class UniversitiesController {
  constructor(
    private readonly universitiesService: UniversitiesService,
    private readonly searchHistoryAnalyticsService: SearchHistoryAnalyticsService,
    private readonly usersService: UsersService,
  ) { }


  @UseGuards(ResourceProtectionGuard)
  @CreateUniversityApiDoc()
  @Post()
  create(
    @Body() createUniversityDto: CreateUniversityDto,
    @Req() req: Request,
  ) {
    const userId = req.user['sub'];
    return this.universitiesService.create(createUniversityDto, userId);
  }

  @FindAllUniversitiesApiDoc()
  @UseGuards(OptionalAuthGuard)
  @Get()
  async findAll(
    @Query() queryDto: QueryUniversityDto,
    @OptionalAuthReq() req: OptionalAuthenticatedRequest,
  ) {
    await this.indexUniversitySearchHistory(req.user?.['sub'], queryDto);
    const result = await this.universitiesService.findAll(queryDto);

    return result;
  }

  // TODO: Remove this endpoint when the admission_program_status is supported in the findAll method
  // TODO: change the endpoint route to /available-programs instead of /open-programs
  @FindAllUniversitiesWithAvailableProgramsApiDoc()
  @UseGuards(OptionalAuthGuard)
  @Get('open-programs')
  async findAllWithAvailablePrograms(
    @Query() queryDto: QueryUniversityDto,
    @OptionalAuthReq() req: OptionalAuthenticatedRequest,
  ) {
    await this.indexUniversitySearchHistory(req.user?.['sub'], queryDto);
    const result =
      await this.universitiesService.findAllWithAvailablePrograms(queryDto);

    return result;
  }

  @GetUniversityDetailListApiDocs()
  @Get('detail-list')
  async getDetailList(
    @Query() queryDto: UniversityDetailListQueryDto,
  ) {
    return this.universitiesService.getDetailList(queryDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @GetMyUniversityApiDoc()
  @Get('me')
  async getMyUniversity(@AuthReq() authReq: AuthenticatedRequest) {
    const userId = authReq.user['sub'];
    return this.universitiesService.getMyUniversity(userId, ['address_id']);
  }

  @FindOneUniversityApiDoc()
  @UseGuards(ResourceProtectionGuard, UniversityAccessGuard('id', (ids) => ids.ID))
  @Get(':id')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {

    return this.universitiesService.findById(id, ['address_id']);
  }
  @Get('slug/:slug')
  @FindOneUniversityBySlugApiDoc()
  @UseGuards(ResourceProtectionGuard, UniversityAccessGuard('slug', (ids) => ids.SLUG))
  async findOneBySlug(
    @Param('slug') slug: string,
  ) {

    return this.universitiesService.findBySlug(slug, ['address_id']);
  }

  // Existing ID-based endpoint
  @GetUniversityProfileByIdApiDoc()
  @Get(':universityId/profile')
  async getUniversityProfile(
    @Param('universityId') universityId: string,
    @Query('selectedCampusId') selectedCampusId?: string,
  ) {
    return this.universitiesService.getUniversityProfile(
      universityId,
      selectedCampusId,
    );
  }

  // New Slug-based endpoint
  @GetUniversityProfileBySlugApiDoc()
  @Get('slug/:slug/profile')
  async getUniversityProfileBySlug(
    @Param('slug') slug: string,
    @Query('selectedCampusId') selectedCampusId?: string,
  ) {
    return this.universitiesService.getUniversityProfileBySlug(
      slug,
      selectedCampusId,
    );
  }

  @UseGuards(ResourceProtectionGuard)
  @UpdateUniversityApiDoc()
  @Patch(':universityId')
  async update(
    @AuthReq() authReq: AuthenticatedRequest,
    @Param('universityId', ParseObjectIdPipe) universityIdParam: Types.ObjectId,
    @Body() updateUniversityDto: UpdateUniversityDto,
  ) {
    const userId = authReq.user.sub;
    const isCampusAdmin = !!authReq.user.campus_id;

    // TODO: Only the admins should be able to update the university; regular student should not be able to update the university

    // If user is a campus admin, check if they are authorized to update this university
    if (isCampusAdmin) {
      const { campus, universityId } = await this.usersService.getUserCampusInfo(userId);
      const isPrimaryCampusAdmin = campus.is_primary;


      // Check if the user is trying to update their own university
      if (!universityIdParam.equals(universityId)) {
        throw new ForbiddenException('You are not authorized to update this university');
      }

      // Only primary campus admins can update universities
      if (!isPrimaryCampusAdmin) {
        throw new ForbiddenException('Not authorized. You must be a primary campus admin to update university details.');
      }

    }

    return this.universitiesService.update(universityIdParam, updateUniversityDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @RemoveUniversityApiDoc()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.universitiesService.remove(id);
  }

  /**
   * Index university search history to Elasticsearch
   */
  private async indexUniversitySearchHistory(
    user_id: string,
    queryDto: QueryUniversityDto,
  ) {
    if (!user_id) {
      // Skip indexing if no user ID (anonymous search)
      return;
    }

    const universitySearchHistory: ISearchHistoryIndexDoc = {
      user_id,
      user_type: UserNS.UserType.Student,
      resource_type: SearchResourceEnum.UNIVERSITY,
      data: {
        university_name: queryDto.name,
        // Add other relevant search parameters
      },
    };

    try {
      await this.searchHistoryAnalyticsService.indexSearchHistory(
        universitySearchHistory,
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to index university search history:', error);
    }
  }
}
