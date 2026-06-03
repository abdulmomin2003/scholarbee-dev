import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProgramTemplatesService } from '../services/program-templates.service';
import { CreateProgramTemplateDto } from '../dto/create-program-template.dto';
import { QueryProgramTemplateDto } from '../dto/query-program-template.dto';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { AllowedUserTypesGuard } from '../../auth/guards/allowed-user-types.guard';
import { AllowedUserTypes } from '../../auth/decorators/allowed-user-types.decorator';
import { UserNS } from '../../users/schemas/user.schema';
import { ApiTags } from '@nestjs/swagger';
import { CreateProgramTemplateApiDoc } from '../api-docs/create-program-template.api-doc';
import { FindAllProgramTemplatesApiDoc } from '../api-docs/find-all-program-templates.api-doc';
import { FindOneProgramTemplateApiDoc } from '../api-docs/find-one-program-template.api-doc';
import { RemoveProgramTemplateApiDoc } from '../api-docs/remove-program-template.api-doc';
import { FieldsOfStudyLookupProgramTemplateApiDoc } from '../api-docs/fields-of-study-lookup.api-doc';
import { QueryFieldsOfStudyDto } from '../dto/query-fields-of-study.dto';

@ApiTags('program-templates')
@Controller('program-templates')
export class ProgramTemplatesController {
  constructor(
    private readonly programTemplatesService: ProgramTemplatesService,
  ) { }

  @UseGuards(ResourceProtectionGuard, AllowedUserTypesGuard)
  @AllowedUserTypes(UserNS.UserType.Super_Admin)
  @CreateProgramTemplateApiDoc()
  @Post()
  create(@Body() createProgramTemplateDto: CreateProgramTemplateDto) {
    return this.programTemplatesService.create(createProgramTemplateDto);
  }

  @FindAllProgramTemplatesApiDoc()
  @Get()
  findAll(@Query() queryDto: QueryProgramTemplateDto) {
    return this.programTemplatesService.findAll(queryDto);
  }

  @FieldsOfStudyLookupProgramTemplateApiDoc()
  @Get('lookup/fields-of-study')
  getFieldsOfStudy(@Query() queryDto: QueryFieldsOfStudyDto) {
    return this.programTemplatesService.findAllFieldsOfStudy(queryDto);
  }

  @FindOneProgramTemplateApiDoc()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programTemplatesService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard, AllowedUserTypesGuard)
  @AllowedUserTypes(UserNS.UserType.Super_Admin)
  @RemoveProgramTemplateApiDoc()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programTemplatesService.remove(id);
  }
}
