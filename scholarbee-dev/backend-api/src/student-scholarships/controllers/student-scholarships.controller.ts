import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IsObjectIdPipe, ParseObjectIdPipe } from 'nestjs-object-id';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { EmailVerifiedGuard } from '../../auth/guards/email-verified.guard';
import { CreateStudentScholarshipDto } from '../dto/create-student-scholarship.dto';
import { QueryStudentScholarshipDto } from '../dto/query-student-scholarship.dto';
import {
  AddRequiredDocumentDto,
  RemoveRequiredDocumentDto,
  UpdateStudentScholarshipApprovalStatusDto,
  UpdateStudentScholarshipDto,
} from '../dto/update-student-scholarship.dto';
import { StudentScholarshipsService } from '../services/student-scholarships.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateStudentScholarshipApiDoc } from '../api-docs/create-student-scholarship.api-doc';
import { UpdateStudentScholarshipApiDoc } from '../api-docs/update-student-scholarship.api-doc';
import { UpdateStudentScholarshipApprovalApiDoc } from '../api-docs/update-approval-status.api-doc';
import { FindStudentScholarshipsApiDoc } from '../api-docs/find-student-scholarships.api-doc';
import { GetStudentScholarshipStatisticsApiDoc } from '../api-docs/get-statistics.api-doc';
import { FindOneStudentScholarshipApiDoc } from '../api-docs/find-one-student-scholarship.api-doc';
import { DeleteStudentScholarshipApiDoc } from '../api-docs/delete-student-scholarship.api-doc';
import { AddRequiredDocumentApiDoc } from '../api-docs/add-required-document.api-doc';
import { RemoveRequiredDocumentApiDoc } from '../api-docs/remove-required-document.api-doc';

@ApiTags('student-scholarships -> ✅ (Verified)')
@Controller('student-scholarships')
export class StudentScholarshipsController {
  constructor(
    private readonly studentScholarshipsService: StudentScholarshipsService,
  ) { }

  @UseGuards(ResourceProtectionGuard, EmailVerifiedGuard /* RolesGuard */)
  // @Roles(Role.ADMIN, Role.STUDENT) // REVIEW: Why the role?
  @Post()
  @CreateStudentScholarshipApiDoc()
  @HttpCode(HttpStatus.OK)
  create(
    @Req() req, // REVIEW: How to type it?
    @Body() createStudentScholarshipDto: CreateStudentScholarshipDto,
  ) {
    const userId = req.user.sub as string;

    return this.studentScholarshipsService.create(
      createStudentScholarshipDto,
      userId,
    );
  }

  @UseGuards(ResourceProtectionGuard /* , RolesGuard */)
  // @Roles(Role.ADMIN, Role.UNIVERSITY_ADMIN)
  @Patch(':id/approval')
  @UpdateStudentScholarshipApprovalApiDoc()
  updateApprovalStatus(
    @Param('id') id: string,
    @Body() payload: UpdateStudentScholarshipApprovalStatusDto,
  ) {
    return this.studentScholarshipsService.updateApprovalStatus(id, payload);
  }

  @Get()
  @FindStudentScholarshipsApiDoc()
  findAll(@Query() queryDto: QueryStudentScholarshipDto) {
    return this.studentScholarshipsService.findAll(queryDto);
  }

  @Get('statistics')
  @GetStudentScholarshipStatisticsApiDoc()
  getStatistics() {
    return this.studentScholarshipsService.getStatistics();
  }

  @Get(':id')
  @FindOneStudentScholarshipApiDoc()
  findOne(@Param('id') id: string) {
    return this.studentScholarshipsService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard /* , RolesGuard */)
  // @Roles(Role.ADMIN)
  @Patch(':id')
  @UpdateStudentScholarshipApiDoc()
  update(
    @Param('id') id: string,
    @Body() updateStudentScholarshipDto: UpdateStudentScholarshipDto,
  ) {
    return this.studentScholarshipsService.update(
      id,
      updateStudentScholarshipDto,
    );
  }

  @UseGuards(ResourceProtectionGuard /* , RolesGuard */)
  // @Roles(Role.ADMIN)
  @Delete(':id')
  @DeleteStudentScholarshipApiDoc()
  remove(@Param('id') id: string) {
    return this.studentScholarshipsService.remove(id);
  }

  @UseGuards(ResourceProtectionGuard /* , RolesGuard */)
  // @Roles(Role.ADMIN)
  @Post(':studentScholarshipId/documents')
  @AddRequiredDocumentApiDoc()
  addRequiredDocument(
    @Param('studentScholarshipId', ParseObjectIdPipe)
    studentScholarshipId: Types.ObjectId,
    @Body() addRequiredDocumentDto: AddRequiredDocumentDto,
  ) {
    return this.studentScholarshipsService.addRequiredDocument(
      studentScholarshipId,
      addRequiredDocumentDto,
    );
  }

  @UseGuards(ResourceProtectionGuard /* , RolesGuard */)
  // @Roles(Role.ADMIN)
  // @Delete(':id/documents/:documentId')
  @Delete(':studentScholarshipId/documents')
  @RemoveRequiredDocumentApiDoc()
  removeRequiredDocument(
    @Param('studentScholarshipId', ParseObjectIdPipe)
    studentScholarshipId: Types.ObjectId,
    @Body() removeRequiredDocumentDto: RemoveRequiredDocumentDto,
  ) {
    return this.studentScholarshipsService.removeRequiredDocument(
      studentScholarshipId,
      removeRequiredDocumentDto,
    );
  }
} 