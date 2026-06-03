import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsObjectId } from 'src/common/validators/object-id.validator';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { Types } from 'mongoose';
import { CampusEntityTypeEnum, CampusTypeEnum } from 'src/campuses/schemas/campus.schema';

class PictureDto {
  @IsString()
  url: string;
}

export class CreateCampusDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  university_id?: Types.ObjectId;

  @IsOptional()
  @IsObjectId({ message: 'Address ID must be a valid ObjectId' })
  @ToObjectId()
  address_id?: Types.ObjectId;

  /**
   * @deprecated Use the `type` field on the associated University document instead.
   * This field will be removed in a future release.
   */
  @ApiProperty({
    deprecated: true,
    description: '[DEPRECATED] Use the `type` field on the University document instead. This field will be removed in a future release.',
    enum: CampusTypeEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(CampusTypeEnum)
  campus_type?: CampusTypeEnum;

  @ApiProperty({
    description: 'Operational role of this campus. Defaults to "public". Use "test" for seed/QA campuses and "support" for the internal support campus.',
    enum: CampusEntityTypeEnum,
    default: CampusEntityTypeEnum.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(CampusEntityTypeEnum)
  entity_type?: CampusEntityTypeEnum;

  @IsOptional()
  @IsDate()
  established_date?: Date;

  @IsOptional()
  @IsNumber()
  campus_area?: number;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsString()
  contact_email?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  student_population?: number;

  @IsOptional()
  @IsBoolean()
  library_facilities?: boolean;

  @IsOptional()
  @IsBoolean()
  sports_facilities?: boolean;

  @IsOptional()
  @IsBoolean()
  dining_options?: boolean;

  @IsOptional()
  @IsBoolean()
  transportation_options?: boolean;

  @IsOptional()
  @IsBoolean()
  residential_facilities?: boolean;

  @IsOptional()
  @IsBoolean()
  healthcare_facilities?: boolean;

  @IsOptional()
  @IsBoolean()
  parking_facilities?: boolean;

  @IsOptional()
  @IsBoolean()
  security_features?: boolean;

  @IsOptional()
  @IsString()
  facilities?: string;

  @IsOptional()
  @IsString()
  accreditations?: string;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PictureDto)
  pictures?: PictureDto[];

  @IsOptional()
  @IsNumber()
  faculty_count?: number;
}
