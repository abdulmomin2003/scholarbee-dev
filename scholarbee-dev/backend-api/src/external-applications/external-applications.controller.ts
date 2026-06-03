import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthReq } from 'src/auth/decorators/auth-req.decorator';
import { ResourceProtectionGuard } from 'src/auth/guards/resource-protection.guard';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { CreateExternalApplicationDto } from './dto/create-external-application.dto';
import { QueryExternalApplicationDto } from './dto/query-external-application.dto';
import { ExternalApplicationsService } from './external-applications.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateExternalApplicationApiDoc } from './api-docs/create-external-application.api-doc';
import { FindAllExternalApplicationsApiDoc } from './api-docs/find-all-external-applications.api-doc';
import { FindOneExternalApplicationApiDoc } from './api-docs/find-one-external-application.api-doc';

@ApiTags('external-applications')
@Controller('external-applications')
@UseGuards(ResourceProtectionGuard)
export class ExternalApplicationsController {
  constructor(
    private readonly externalApplicationsService: ExternalApplicationsService,
  ) { }

  @Post()
  @CreateExternalApplicationApiDoc()
  create(
    @Body() createExternalApplicationDto: CreateExternalApplicationDto,
    @Req() req,
  ) {
    return this.externalApplicationsService.create(
      req.user,
      createExternalApplicationDto,
    );
  }

  @Get()
  @FindAllExternalApplicationsApiDoc()
  findAll(
    @AuthReq() authReq: AuthenticatedRequest,
    @Query() queryDto: QueryExternalApplicationDto,
  ) {
    return this.externalApplicationsService.findAll(authReq.user, queryDto);
  }

  @Get(':id')
  @FindOneExternalApplicationApiDoc()
  findOne(@Param('id') id: string, @Req() req) {
    return this.externalApplicationsService.findOne(id, req.user.sub);
  }
}
