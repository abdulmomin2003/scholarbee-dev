import {
  IsOptional,
  IsString,
  IsMongoId,
  IsDate,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationStatus } from '../schemas/application.schema';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { IsObjectId } from 'src/common/validators/object-id.validator';
import { Types } from 'mongoose';

export class QueryApplicationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  admission_program_id?: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  campus_id?: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  program?: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  admission_id?: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  applicant_id?: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @IsEnum(ApplicationStatus, { each: true })
  /**
   * Filter applications by status. Supports multiple statuses.
   * Example: ?status=Draft&status=Pending&status=Approved
   * or ?status[]=Draft&status[]=Pending&status[]=Approved
   */
  status?: ApplicationStatus[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  submissionDateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  submissionDateTo?: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  populate?: boolean = true;
}
