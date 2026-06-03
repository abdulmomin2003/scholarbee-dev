import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { IsObjectId } from 'src/common/validators/object-id.validator';
import { ProgramDurationEnum } from 'src/programs/schemas/program.schema';

export class QueryProgramDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsEnum(ProgramDurationEnum)
  @IsString()
  duration?: ProgramDurationEnum;

  @IsOptional()
  @IsString()
  mode_of_study?: string;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  university_id?: Types.ObjectId;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  campus_id?: Types.ObjectId;

  /** This will be used to filter based on multiple campus_id fields */
  @IsOptional()
  @IsArray()
  @IsObjectId({ each: true })
  @ToObjectId()
  campus_ids?: Types.ObjectId[];

  @IsOptional()
  @IsEnum(DegreeLevelEnum)
  degree_level?: DegreeLevelEnum;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  academic_departments?: Types.ObjectId;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  populate?: boolean = true;
}

export class QueryProgramByCampusDto extends OmitType(QueryProgramDto, ['campus_id', 'campus_ids']) { }