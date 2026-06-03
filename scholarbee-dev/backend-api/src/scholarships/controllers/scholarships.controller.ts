import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthReq, OptionalAuthReq } from 'src/auth/decorators/auth-req.decorator';
import { AuthenticatedRequest, OptionalAuthenticatedRequest } from 'src/auth/types/auth.interface';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateScholarshipDto } from '../dto/create-scholarship.dto';
import { QueryScholarshipDto } from '../dto/query-scholarship.dto';
import { ScholarshipCronService } from '../services/scholarship-cron.service';
import { ScholarshipsService } from '../services/scholarships.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateScholarshipApiDoc } from '../api-docs/create-scholarship.api-doc';
import { FindScholarshipsApiDoc } from '../api-docs/find-scholarships.api-doc';
import { GetScholarshipsCountApiDoc } from '../api-docs/get-count-scholarships.api-doc';
import { GetScholarshipByIdApiDoc } from '../api-docs/get-scholarship-by-id.api-doc';
import { UpdateScholarshipApiDoc } from '../api-docs/update-scholarship.api-doc';
import { DeleteScholarshipApiDoc } from '../api-docs/delete-scholarship.api-doc';
import { AddToFavoritesApiDoc } from '../api-docs/add-to-favorites.api-doc';
import { RemoveFromFavoritesApiDoc } from '../api-docs/remove-from-favorites.api-doc';
import { FindFavoritesApiDoc } from '../api-docs/find-favorites.api-doc';
import { AdminUpdateExpiredApiDoc } from '../api-docs/admin-update-expired.api-doc';
import { AdminExpiredCountApiDoc } from '../api-docs/admin-expired-count.api-doc';

@ApiTags('scholarships -> ✅ (Verified)')
@Controller('scholarships')
export class ScholarshipsController {
  constructor(
    private readonly scholarshipsService: ScholarshipsService,
    private readonly scholarshipCronService: ScholarshipCronService,
  ) { }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @CreateScholarshipApiDoc()
  create(
    @Body() createScholarshipDto: CreateScholarshipDto,
    @AuthReq() authReq: AuthenticatedRequest,
  ) {
    return this.scholarshipsService.create(
      createScholarshipDto,
      authReq.user.sub,
    );
  }

  @Get()
  @FindScholarshipsApiDoc()
  findAll(@Query() queryDto: QueryScholarshipDto) {
    return this.scholarshipsService.findAll(queryDto);
  }

  /**
   * Get total count of scholarships
   * 
   * @description
   * Returns the total number of scholarships in the database.
   * 
   * @access Public
   * @returns Total count of scholarships
   */
  @GetScholarshipsCountApiDoc()
  @Get('count')
  getTotalCount() {
    return this.scholarshipsService.getTotalCount();
  }

  @Get(':scholarshipId')
  @GetScholarshipByIdApiDoc()
  findOne(
    @Param('scholarshipId') scholarshipId: string,
    @OptionalAuthReq() authReq: OptionalAuthenticatedRequest,
  ) {
    return this.scholarshipsService.findOne(scholarshipId, authReq.user?._id);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UpdateScholarshipApiDoc()
  update(
    @Param('id') id: string,
    @Body() updateScholarshipDto: Partial<CreateScholarshipDto>,
  ) {
    return this.scholarshipsService.update(id, updateScholarshipDto);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @DeleteScholarshipApiDoc()
  remove(@Param('id') id: string) {
    return this.scholarshipsService.remove(id);
  }

  @UseGuards(ResourceProtectionGuard)
  @Post(':scholarshipId/favorites')
  @AddToFavoritesApiDoc()
  addToFavorites(
    @Param('scholarshipId') scholarshipId: string,
    @AuthReq() authReq: AuthenticatedRequest,
  ) {
    return this.scholarshipsService.addToFavorites(
      scholarshipId,
      authReq.user.sub,
    );
  }

  @UseGuards(ResourceProtectionGuard)
  @Delete(':id/favorites')
  @RemoveFromFavoritesApiDoc()
  removeFromFavorites(
    @Param('id') id: string,
    @AuthReq() authReq: AuthenticatedRequest,
  ) {
    return this.scholarshipsService.removeFromFavorites(id, authReq.user.sub);
  }

  @UseGuards(ResourceProtectionGuard)
  @Get('user/favorites')
  @FindFavoritesApiDoc()
  findFavorites(
    @AuthReq() authReq: AuthenticatedRequest,
    @Query() queryDto: QueryScholarshipDto,
  ) {
    return this.scholarshipsService.findFavorites(authReq.user.sub, queryDto);
  }

  // Admin endpoint to manually trigger expired scholarships update (for testing)
  @UseGuards(ResourceProtectionGuard)
  @Roles(Role.ADMIN)
  @Post('admin/update-expired')
  @AdminUpdateExpiredApiDoc()
  async manuallyUpdateExpiredScholarships() {
    await this.scholarshipCronService.manuallyUpdateExpiredScholarships();
    return { message: 'Expired scholarships update completed' };
  }

  // Admin endpoint to get count of scholarships that should be expired
  @UseGuards(ResourceProtectionGuard)
  @Roles(Role.ADMIN)
  @Get('admin/expired-count')
  @AdminExpiredCountApiDoc()
  async getExpiredScholarshipsCount() {
    const count =
      await this.scholarshipCronService.getExpiredScholarshipsCount();
    return { expiredCount: count };
  }
}
