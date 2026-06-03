import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { LegalDocumentRequirementsService } from './legal-document-requirements.service';
import { LegalDocumentRequirement } from './schemas/legal-document-requirement.schema';
import { QueryLegalDocumentRequirementsDto } from './dto/query-legal-document-requirements.dto';
import { ApiTags } from '@nestjs/swagger';
import { FindAllLegalDocumentRequirementsApiDoc } from './api-docs/find-all-legal-document-requirements.api-doc';
import { FindOneLegalDocumentRequirementApiDoc } from './api-docs/find-one-legal-document-requirement.api-doc';

@ApiTags('legal-document-requirements')
@Controller('legal-document-requirements')
export class LegalDocumentRequirementsController {
  constructor(
    private readonly legalDocumentRequirementsService: LegalDocumentRequirementsService,
  ) { }

  @Get()
  @FindAllLegalDocumentRequirementsApiDoc()
  async findAll(
    @Query() queryDto: QueryLegalDocumentRequirementsDto,
  ): Promise<LegalDocumentRequirement[]> {
    return this.legalDocumentRequirementsService.findAll(queryDto);
  }

  @Get(':id')
  @FindOneLegalDocumentRequirementApiDoc()
  async findById(
    @Param('id') id: string,
  ): Promise<LegalDocumentRequirement | null> {
    return this.legalDocumentRequirementsService.findById(id);
  }
}
