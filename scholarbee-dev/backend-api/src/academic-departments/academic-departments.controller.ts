import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AcademicDepartmentsService } from './academic-departments.service';
import { ResourceProtectionGuard } from '../auth/guards/resource-protection.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateAcademicDepartmentApiDoc } from './api-docs/create-academic-department.api-doc';
import { FindAllAcademicDepartmentsApiDoc } from './api-docs/find-all-academic-departments.api-doc';
import { FindOneAcademicDepartmentApiDoc } from './api-docs/find-one-academic-department.api-doc';
import { UpdateAcademicDepartmentApiDoc } from './api-docs/update-academic-department.api-doc';
import { RemoveAcademicDepartmentApiDoc } from './api-docs/remove-academic-department.api-doc';

@ApiTags('academic-departments')
@Controller('academic-departments')
export class AcademicDepartmentsController {
  constructor(
    private readonly academicDepartmentsService: AcademicDepartmentsService,
  ) { }

  @UseGuards(ResourceProtectionGuard)
  @Post()
  @CreateAcademicDepartmentApiDoc()
  create(
    @Body() createAcademicDepartmentDto: any,
    @Param('userId') userId: string,
  ) {
    return this.academicDepartmentsService.create(
      createAcademicDepartmentDto,
      userId,
    );
  }

  @Get()
  @FindAllAcademicDepartmentsApiDoc()
  findAll(@Query() query: any) {
    return this.academicDepartmentsService.findAll(query);
  }

  @Get(':id')
  @FindOneAcademicDepartmentApiDoc()
  findOne(@Param('id') id: string) {
    return this.academicDepartmentsService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard)
  @Patch(':id')
  @UpdateAcademicDepartmentApiDoc()
  update(@Param('id') id: string, @Body() updateAcademicDepartmentDto: any) {
    return this.academicDepartmentsService.update(
      id,
      updateAcademicDepartmentDto,
    );
  }

  @UseGuards(ResourceProtectionGuard)
  @Delete(':id')
  @RemoveAcademicDepartmentApiDoc()
  remove(@Param('id') id: string) {
    return this.academicDepartmentsService.remove(id);
  }
} 