import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { ApiTags } from '@nestjs/swagger';
import { IndexDocumentApiDoc } from './api-docs/index-document.api-doc';
import { BulkApiDoc } from './api-docs/bulk.api-doc';
import { SearchApiDoc } from './api-docs/search.api-doc';
import { DeleteDocumentApiDoc } from './api-docs/delete-document.api-doc';
import { UpdateDocumentApiDoc } from './api-docs/update-document.api-doc';
import { GetDocumentApiDoc } from './api-docs/get-document.api-doc';
import { DeleteIndexApiDoc } from './api-docs/delete-index.api-doc';

// TODO: Remove this controller after testing
@ApiTags('elasticsearch')
@Controller('elasticsearch')
export class ElasticsearchController {
  constructor(private readonly elasticsearchService: ElasticsearchService) { }


  @Put('index/:index/document/:id')
  @IndexDocumentApiDoc()
  async indexDocument(
    @Param('index') index: string,
    @Param('id') id: string,
    @Body() document: Record<string, any>,
  ) {
    console.log(` document:`, document)
    return {
      success: await this.elasticsearchService.indexDocument(index, id, document),
    };
  }

  @Post('bulk')
  @BulkApiDoc()
  async bulk(@Body() operations: any[]) {
    return { success: await this.elasticsearchService.bulk(operations) };
  }

  @Post('search/:index')
  @SearchApiDoc()
  async search(
    @Param('index') index: string,
    @Body() query: Record<string, unknown>,
  ) {
    return await this.elasticsearchService.search(index, query)
  }

  @Delete('index/:index/document/:id')
  @DeleteDocumentApiDoc()
  async deleteDocument(
    @Param('index') index: string,
    @Param('id') id: string,
  ) {
    return {
      success: await this.elasticsearchService.deleteDocument(index, id),
    };
  }

  @Post('index/:index/document/:id/update')
  @UpdateDocumentApiDoc()
  async updateDocument(
    @Param('index') index: string,
    @Param('id') id: string,
    @Body() doc: Record<string, any>,
  ) {
    return {
      success: await this.elasticsearchService.updateDocument(index, id, doc),
    };
  }

  @Get('index/:index/document/:id')
  @GetDocumentApiDoc()
  async getDocument(
    @Param('index') index: string,
    @Param('id') id: string,
  ) {
    return await this.elasticsearchService.getDocument(index, id);
  }

  @Delete('index/:index')
  @DeleteIndexApiDoc()
  async deleteIndex(@Param('index') index: string) {
    return { success: await this.elasticsearchService.deleteIndex(index) };
  }
} 