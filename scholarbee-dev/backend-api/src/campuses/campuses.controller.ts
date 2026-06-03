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
  ForbiddenException,
  NotFoundException
} from '@nestjs/common';
import { AuthReq, OptionalAuthReq } from 'src/auth/decorators/auth-req.decorator';
import { AuthenticatedRequest, OptionalAuthenticatedRequest } from 'src/auth/types/auth.interface';
import { ResourceProtectionGuard } from '../auth/guards/resource-protection.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CampusesService } from './campuses.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  QueryCampusDto
} from './dto/query-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { AddPictureDto } from './dto/add-picture.dto';
import { RemovePictureDto } from './dto/remove-picture.dto';
import { ParseObjectIdPipe } from 'src/common/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { FindCampusesByUniversityApiDoc } from './api-docs/find-by-university-campuses.api-doc';
import { GetCampusPicturesApiDoc } from './api-docs/get-campus-pictures.api-doc';
import { FindOneCampusApiDoc } from './api-docs/find-one-campus.api-doc';
import { FindOneCampusBySlugApiDoc } from './api-docs/find-one-campus-by-slug.api-doc';
import { GetOrCreateSupportCampusApiDoc } from './api-docs/get-or-create-support-campus.api-doc';
import { FindAllCampusesApiDoc } from './api-docs/find-all-campuses.api-doc';
import { GetCampusesCountApiDoc } from './api-docs/get-count-campuses.api-doc';
import { CreateCampusApiDoc } from './api-docs/create-campus.api-doc';
import { RemoveCampusApiDoc } from './api-docs/remove-campus.api-doc';
import { HasValidAdminsApiDoc } from './api-docs/has-valid-admins.api-doc';
import { UpdateCampusApiDoc } from './api-docs/update-campus.api-doc';
import { GetApplicantsByProgramApiDoc } from './api-docs/get-applicants-by-program.api-doc';
import { QueryApplicantsByProgramDto } from './dto/query-applicants-by-program.dto';
import { UserNS } from '../users/schemas/user.schema';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';
import { favoriteCampusApiDocs } from './api-docs/favorite.api-doc';
import { UnfavoriteCampusApiDocs } from './api-docs/unfavorite.api-doc';
import { getUserFavoriteCampusApiDocs } from './api-docs/get-user-favorite.api-doc';
import { FindAllPartnersApiDoc } from './api-docs/find-all-partners.api-doc';
import { GetCampusDetailApiDoc } from './api-docs/get-campus-detail.api-doc';
import { CampusDetailQueryDto } from './dto/campus-detail-query.dto';

@ApiTags('campuses')
@Controller('campuses')
export class CampusesController {
  constructor(
    private readonly campusesService: CampusesService,
    private readonly usersService: UsersService,
  ) { }


  @UseGuards(ResourceProtectionGuard)
  @Post()
  @CreateCampusApiDoc()
  create(@Body() createCampusDto: CreateCampusDto, @AuthReq() req: AuthenticatedRequest) {
    const userId = req.user['sub'];
    return this.campusesService.create(createCampusDto, userId);
  }

  @FindAllCampusesApiDoc()
  @UseGuards(OptionalAuthGuard)
  @Get()
  async findAll(
    @Query() queryDto: QueryCampusDto,
    @OptionalAuthReq() req: OptionalAuthenticatedRequest,
  ) {
    // Pass the user ID to check favorite status
    const userId = req.user?.['sub'];
    const result = await this.campusesService.findAll(queryDto, {}, userId);

    return result;
  }

  /**
   * Get total count of campuses
   * 
   * @description
   * Returns the total number of campuses in the database (excluding test entities).
   * 
   * @access Public
   * @returns Total count of campuses
   */
  @GetCampusesCountApiDoc()
  @Get('count')
  getTotalCount() {
    return this.campusesService.getTotalCount();
  }

  @Get('support-campus')
  @GetOrCreateSupportCampusApiDoc()
  async getOrCreateSupportCampus() {
    const supportCampus =
      await this.campusesService.findOrCreateSupportCampus();
    return supportCampus;
  }

  @getUserFavoriteCampusApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Get('favorites')
  findFavorites(@Req() req, @Query() queryDto: QueryCampusDto) {
    return this.campusesService.findFavorites(req.user.sub, queryDto);
  }

  @GetCampusDetailApiDoc()
  @Get('slug/:slug')
  getCampusDetail(@Query() queryDto: CampusDetailQueryDto) {
    return this.campusesService.getCampusDetail(queryDto.slug, queryDto.city);
  }

  @Get(':campus_id')
  @FindOneCampusApiDoc()
  findOne(@Param('campus_id', ParseObjectIdPipe) campus_id: Types.ObjectId) {
    return this.campusesService.findById(campus_id);
  }

  // Disabled this endpoint for now and have to remove it completely once the above slug-based endpoint is fully tested.
  // @Get('slug/:slug')
  // @FindOneCampusBySlugApiDoc()
  // async findOneBySlug(@Param('slug') slug: string) {
  //   const campus = await this.campusesService.findBySlug(slug);
  //   if (!campus) {
  //     throw new NotFoundException(`Campus with slug ${slug} not found`);
  //   }
  //   return campus;
  // }

  @Get(':id/pictures')
  @GetCampusPicturesApiDoc()
  async getCampusPictures(@Param('id') id: string) {
    return this.campusesService.getCampusPictures(id);
  }

  @FindAllPartnersApiDoc()
  @Get('lookup/partners')
  async findAllPartners() {
    return this.campusesService.findAllPartners();
  }

  @Get('university/:universityId')
  @FindCampusesByUniversityApiDoc()
  findByUniversity(@Param('universityId') universityId: string) {
    return this.campusesService.findByUniversity(universityId);
  }

  @UseGuards(ResourceProtectionGuard)
  @UpdateCampusApiDoc()
  @Patch(':campusId')
  async update(
    @AuthReq() authReq: AuthenticatedRequest,
    @Param('campusId', ParseObjectIdPipe) campusIdParam: Types.ObjectId,
    @Body() updateCampusDto: UpdateCampusDto,
  ) {
    await this.campusesService.checkCampusAccessAuth(
      authReq.user.sub,
      campusIdParam,
      authReq.user.campus_id,
    );

    return this.campusesService.update(campusIdParam.toString(), updateCampusDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @Delete(':id')
  @RemoveCampusApiDoc()
  remove(@Param('id') id: string) {
    return this.campusesService.remove(id);
  }

  @UseGuards(ResourceProtectionGuard)
  @Get(':id/has-admins')
  @HasValidAdminsApiDoc()
  async hasValidAdmins(@Param('id') id: string) {
    const hasAdmins = await this.campusesService.hasValidAdmins(id);
    return { hasAdmins };
  }

  @UseGuards(ResourceProtectionGuard)
  @Post(':campusId/pictures')
  async addPicture(
    @AuthReq() authReq: AuthenticatedRequest,
    @Param('campusId', ParseObjectIdPipe) campusIdParam: Types.ObjectId,
    @Body() addPictureDto: AddPictureDto,
  ) {
    await this.campusesService.checkCampusAccessAuth(
      authReq.user.sub,
      campusIdParam,
      authReq.user.campus_id,
    );

    return this.campusesService.addPicture(campusIdParam.toString(), addPictureDto.url);
  }

  @UseGuards(ResourceProtectionGuard)
  @Delete(':campusId/pictures')
  async removePicture(
    @AuthReq() authReq: AuthenticatedRequest,
    @Param('campusId', ParseObjectIdPipe) campusIdParam: Types.ObjectId,
    @Body() removePictureDto: RemovePictureDto,
  ) {
    await this.campusesService.checkCampusAccessAuth(
      authReq.user.sub,
      campusIdParam,
      authReq.user.campus_id,
    );

    return this.campusesService.removePicture(
      campusIdParam.toString(),
      removePictureDto.url,
      removePictureDto.index,
    );
  }

  @UseGuards(ResourceProtectionGuard)
  @Get(':campusId/analytics/applicants-by-program')
  @GetApplicantsByProgramApiDoc()
  async getApplicantsByProgram(
    @AuthReq() authReq: AuthenticatedRequest,
    @Param('campusId', ParseObjectIdPipe) campusIdParam: Types.ObjectId,
    @Query() queryDto: QueryApplicantsByProgramDto,
  ) {
    // Validate user is campus admin
    if (authReq.user.user_type !== UserNS.UserType.Campus_Admin) {
      throw new ForbiddenException('Only campus admins can access this endpoint');
    }

    // Validate campus access (read-only)
    await this.campusesService.checkCampusAccessAuth(
      authReq.user.sub,
      campusIdParam,
      authReq.user.campus_id,
    );

    return this.campusesService.getApplicantsByProgram(
      campusIdParam,
      queryDto.degreeLevel as DegreeLevelEnum | undefined,
      queryDto.includeZeroApplicants || false,
    );
  }

  @favoriteCampusApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Post(':campus_id/favorites')
  addToFavorites(
    @Param('campus_id', ParseObjectIdPipe) campus_id: Types.ObjectId,
    @Req() req,
  ) {
    return this.campusesService.addToFavorites(
      campus_id,
      req.user.sub,
    );
  }

  @UnfavoriteCampusApiDocs()
  @UseGuards(ResourceProtectionGuard)
  @Delete(':campus_id/favorites')
  removeFromFavorites(
    @Param('campus_id', ParseObjectIdPipe) campus_id: Types.ObjectId,
    @AuthReq() req: AuthenticatedRequest,
  ) {
    return this.campusesService.removeFromFavorites(
      campus_id,
      req.user.sub,
    );
  }
}
