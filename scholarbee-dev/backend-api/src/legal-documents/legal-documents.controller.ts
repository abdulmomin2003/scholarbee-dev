import { Controller, Get, Param, Query } from '@nestjs/common';
import { LegalDocumentsService } from './legal-documents.service';
import { LegalDocument } from './schemas/legal-document.schema';
import { QueryLegalDocumentsDto } from './dto/query-legal-documents.dto';
import { ApiTags } from '@nestjs/swagger';
import { FindAllLegalDocumentsApiDoc } from './api-docs/find-all-legal-documents.api-doc';
import { FindOneLegalDocumentApiDoc } from './api-docs/find-one-legal-document.api-doc';

@ApiTags('legal-documents')
@Controller('legal-documents')
export class LegalDocumentsController {
  constructor(private readonly legalDocumentsService: LegalDocumentsService) { }

  @Get()
  @FindAllLegalDocumentsApiDoc()
  async findAll(
    @Query() queryDto: QueryLegalDocumentsDto,
  ) {
    return this.legalDocumentsService.findAll(queryDto);
  }

  @Get(':id')
  @FindOneLegalDocumentApiDoc()
  async findById(@Param('id') id: string): Promise<LegalDocument | null> {
    return this.legalDocumentsService.findById(id);
  }
}
