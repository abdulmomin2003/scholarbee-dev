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
import { FeesService, normalizeFeeStructure } from '../services/fee-structures.service';
import { CreateFeeDto } from '../dto/create-fee-structure.dto';
import { UpdateFeeDto } from '../dto/update-fee-structure.dto';
import { QueryFeeDto } from '../dto/query-fee-structure.dto';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateFeeApiDoc } from '../api-docs/create-fee.api-doc';
import { FindAllFeesApiDoc } from '../api-docs/find-all-fees.api-doc';
import { GetFeesStatisticsApiDoc } from '../api-docs/get-statistics-fees.api-doc';
import { FindFeesByProgramApiDoc } from '../api-docs/find-by-program-fees.api-doc';
import { FindOneFeeApiDoc } from '../api-docs/find-one-fee.api-doc';
import { UpdateFeeApiDoc } from '../api-docs/update-fee.api-doc';
import { RemoveFeeApiDoc } from '../api-docs/remove-fee.api-doc';

@ApiTags('fees')
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) { }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @CreateFeeApiDoc()
  async create(@Body() createFeeDto: CreateFeeDto) {
    const feeStructure = await this.feesService.create(createFeeDto);
    return normalizeFeeStructure(feeStructure);
  }

  @UseGuards(ResourceProtectionGuard)
  @Get()
  @FindAllFeesApiDoc()
  async findAll(@Query() queryDto: QueryFeeDto) {
    // Service now returns normalized data with computed fees
    return await this.feesService.findAll(queryDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @Get('statistics')
  @GetFeesStatisticsApiDoc()
  getStatistics() {
    return this.feesService.getStatistics();
  }

  @UseGuards(ResourceProtectionGuard)
  @Get('program/:programId')
  @FindFeesByProgramApiDoc()
  async findByProgramId(@Param('programId') programId: string) {
    const feeStructures = await this.feesService.findByProgramId(programId);
    return feeStructures.map((fee) => normalizeFeeStructure(fee));
  }

  @UseGuards(ResourceProtectionGuard)
  @Get(':id')
  @FindOneFeeApiDoc()
  async findOne(@Param('id') id: string) {
    // Service now returns normalized data with computed fees
    return await this.feesService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UpdateFeeApiDoc()
  async update(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    const feeStructure = await this.feesService.update(id, updateFeeDto);
    return normalizeFeeStructure(feeStructure);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @RemoveFeeApiDoc()
  remove(@Param('id') id: string) {
    return this.feesService.remove(id);
  }
} 