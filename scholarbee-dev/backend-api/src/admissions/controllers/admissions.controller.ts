import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  BadRequestException
} from '@nestjs/common';
import {
  ApiTags,
} from '@nestjs/swagger';
import { CreateAdmissionApiDoc } from '../api-docs/create-admission.api-doc';
import { FindAdmissionsApiDoc } from '../api-docs/find-admissions.api-doc';
import { GetAdmissionApiDoc } from '../api-docs/get-admission.api-doc';
import { FindAdmissionsByUniversityApiDoc } from '../api-docs/find-by-university.api-doc';
import { FindAdmissionsByCampusApiDoc } from '../api-docs/find-by-campus.api-doc';
import { UpdateAdmissionApiDoc } from '../api-docs/update-admission.api-doc';
import { DeleteAdmissionApiDoc } from '../api-docs/delete-admission.api-doc';
import { AdmissionsService } from '../services/admissions.service';
import { CreateAdmissionDto } from '../dto/create-admission.dto';
import { UpdateAdmissionDto } from '../dto/update-admission.dto';
import { QueryAdmissionDto } from '../dto/query-admission.dto';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';

@ApiTags('admissions -> ✅ (Verified)')
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) { }

  @UseGuards(ResourceProtectionGuard)
  @Post()
  @CreateAdmissionApiDoc()
  create(@Body() createAdmissionDto: CreateAdmissionDto, @Req() req) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.admissionsService.create(createAdmissionDto, userId);
  }

  @Get()
  @FindAdmissionsApiDoc()
  findAll(@Query() queryDto: QueryAdmissionDto) {
    return this.admissionsService.findAll(queryDto);
  }

  @Get(':id')
  @GetAdmissionApiDoc()
  findOne(
    @Param('id') id: string,
    @Query('populate') populate: boolean = true,
  ) {
    return this.admissionsService.findOne(id, populate);
  }

  @Get('university/:universityId')
  @FindAdmissionsByUniversityApiDoc()
  findByUniversity(
    @Param('universityId') universityId: string,
    @Query() queryDto: QueryAdmissionDto,
  ) {
    return this.admissionsService.findByUniversity(universityId, queryDto);
  }

  @Get('campus/:campusId')
  @FindAdmissionsByCampusApiDoc()
  findByCampus(
    @Param('campusId') campusId: string,
    @Query() queryDto: QueryAdmissionDto,
  ) {
    return this.admissionsService.findByCampus(campusId, queryDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @Patch(':id')
  @UpdateAdmissionApiDoc()
  update(
    @Param('id') id: string,
    @Body() updateAdmissionDto: UpdateAdmissionDto,
  ) {
    return this.admissionsService.update(id, updateAdmissionDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @Delete(':id')
  @DeleteAdmissionApiDoc()
  remove(@Param('id') id: string) {
    return this.admissionsService.remove(id);
  }
} 