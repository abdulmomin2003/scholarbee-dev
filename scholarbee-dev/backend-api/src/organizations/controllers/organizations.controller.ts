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
} from '@nestjs/common';
import { OrganizationsService } from '../services/organizations.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { QueryOrganizationDto } from '../dto/query-organization.dto';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrganizationApiDoc } from '../api-docs/create-organization.api-doc';
import { FindAllOrganizationsApiDoc } from '../api-docs/find-all-organizations.api-doc';
import { GetOrganizationsStatisticsApiDoc } from '../api-docs/get-statistics-organizations.api-doc';
import { FindOneOrganizationApiDoc } from '../api-docs/find-one-organization.api-doc';
import { UpdateOrganizationApiDoc } from '../api-docs/update-organization.api-doc';
import { RemoveOrganizationApiDoc } from '../api-docs/remove-organization.api-doc';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @CreateOrganizationApiDoc()
  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @FindAllOrganizationsApiDoc()
  @Get()
  findAll(@Query() queryDto: QueryOrganizationDto) {
    return this.organizationsService.findAll(queryDto);
  }

  @GetOrganizationsStatisticsApiDoc()
  @Get('statistics')
  getStatistics() {
    return this.organizationsService.getStatistics();
  }

  @FindOneOrganizationApiDoc()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UpdateOrganizationApiDoc()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @RemoveOrganizationApiDoc()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
} 