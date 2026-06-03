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
import { RegionsService } from '../services/regions.service';
import { CreateRegionDto } from '../dto/create-region.dto';
import { UpdateRegionDto } from '../dto/update-region.dto';
import { QueryRegionDto } from '../dto/query-region.dto';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateRegionApiDoc } from '../api-docs/create-region.api-doc';
import { FindAllRegionsApiDoc } from '../api-docs/find-all-regions.api-doc';
import { GetRegionsStatisticsApiDoc } from '../api-docs/get-statistics-regions.api-doc';
import { FindOneRegionApiDoc } from '../api-docs/find-one-region.api-doc';
import { UpdateRegionApiDoc } from '../api-docs/update-region.api-doc';
import { RemoveRegionApiDoc } from '../api-docs/remove-region.api-doc';
import { AddCityToRegionApiDoc } from '../api-docs/add-city-region.api-doc';
import { RemoveCityFromRegionApiDoc } from '../api-docs/remove-city-region.api-doc';

@ApiTags('regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) { }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @CreateRegionApiDoc()
  @Post()
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionsService.create(createRegionDto);
  }

  @FindAllRegionsApiDoc()
  @Get()
  findAll(@Query() queryDto: QueryRegionDto) {
    return this.regionsService.findAll(queryDto);
  }

  @GetRegionsStatisticsApiDoc()
  @Get('statistics')
  getStatistics() {
    return this.regionsService.getStatistics();
  }

  @FindOneRegionApiDoc()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionsService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UpdateRegionApiDoc()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    return this.regionsService.update(id, updateRegionDto);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @RemoveRegionApiDoc()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionsService.remove(id);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @AddCityToRegionApiDoc()
  @Patch(':id/cities')
  addCity(@Param('id') id: string, @Body('city') city: string) {
    return this.regionsService.addCity(id, city);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @RemoveCityFromRegionApiDoc()
  @Delete(':id/cities/:city')
  removeCity(@Param('id') id: string, @Param('city') city: string) {
    return this.regionsService.removeCity(id, city);
  }
} 