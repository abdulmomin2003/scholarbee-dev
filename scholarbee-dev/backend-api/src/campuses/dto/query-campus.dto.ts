import { IsOptional, IsString, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdmissionStatusEnum } from '../../admissions/schemas/admission.schema';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { IsObjectId } from 'src/common/validators/object-id.validator';
import { Types } from 'mongoose';
import { OmitType } from '@nestjs/mapped-types';
import { CampusTypeEnum } from '../schemas/campus.schema';
import { UniversityTypeEnum } from '../../universities/schemas/university.schema';

export class QueryCampusDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  // an enum query parameter to get the campuses according to the status of the programs i.e. "available" or "unavailable"
  @IsOptional()
  @IsEnum(AdmissionStatusEnum)
  admission_program_status?: AdmissionStatusEnum;

  /**
   * @deprecated Use `university_type` instead.
   * This param no longer has any effect. Will be removed in a future release.
   */
  @ApiProperty({
    deprecated: true,
    description: '[DEPRECATED] Use `university_type` instead. This param will be removed in a future release.',
    enum: CampusTypeEnum,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const arr = Array.isArray(value) ? value : String(value).split(',');
    return arr.map((v: string) => v.trim()).filter(Boolean);
  })
  @IsArray()
  @IsEnum(CampusTypeEnum, { each: true })
  campus_type?: CampusTypeEnum[];

  // Filter campuses by one or more university types (university_id.type).
  // Accepts a comma-separated string (?university_type=government,private)
  // or repeated query keys (?university_type=government&university_type=private).
  @ApiProperty({
    description: 'Filter by one or more university types. Accepts comma-separated or repeated values.',
    enum: UniversityTypeEnum,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const arr = Array.isArray(value) ? value : String(value).split(',');
    return arr.map((v: string) => v.trim()).filter(Boolean);
  })
  @IsArray()
  @IsEnum(UniversityTypeEnum, { each: true })
  university_type?: UniversityTypeEnum[];

  // When true, only campuses with is_partner === true are returned.
  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true) ? true : undefined)
  @IsBoolean()
  partner_university?: boolean;

  @IsOptional()
  @IsArray()
  @IsObjectId({ each: true })
  @ToObjectId()
  favouriteBy?: Types.ObjectId[];

  // Area filters
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Generic area (searches city/state/country/address_line_1 in MongoDB)
  @IsOptional()
  @IsString()
  area?: string;
}

export class QueryCampusFavoritesDto extends OmitType(QueryCampusDto, ['favouriteBy']) {
}

// campusId, year
export class QueryCampusStatisticsDto {
  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  campusId?: Types.ObjectId;

  @IsOptional()
  @IsString()
  year?: string;
}
