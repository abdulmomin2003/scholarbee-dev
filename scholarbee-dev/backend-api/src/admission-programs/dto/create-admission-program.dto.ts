import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { Types } from 'mongoose';
import { IsObjectId } from 'src/common/validators/object-id.validator';

class AdmissionRequirementValueChildDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  children?: any[];

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  bold?: boolean;

  @IsOptional()
  italic?: boolean;

  @IsOptional()
  underline?: boolean;

  @IsOptional()
  newTab?: boolean;

  @IsOptional()
  code?: boolean;
}

class AdmissionRequirementValueDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdmissionRequirementValueChildDto)
  children: AdmissionRequirementValueChildDto[];

  @IsOptional()
  @IsString()
  type?: string;
}

class AdmissionRequirementDto {
  @IsString()
  id: string;

  @IsString()
  key: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdmissionRequirementValueDto)
  value: AdmissionRequirementValueDto[];
}

export class CreateAdmissionProgramDto {
  @IsObjectId({ message: 'Admission ID must be a valid MongoDB ObjectId' })
  @ToObjectId()
  admission: Types.ObjectId;

  @IsOptional()
  @IsString()
  admission_fee?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdmissionRequirementDto)
  admission_requirements: AdmissionRequirementDto[];

  @IsNumber()
  available_seats: number;

  @IsObjectId({ message: 'Program ID must be a valid MongoDB ObjectId' })
  @ToObjectId()
  program: Types.ObjectId;

  /**
   * Optional SEO-friendly slug
   * If not provided, will be auto-generated from admission title, program name, and campus name
   */
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  redirect_deeplink?: string;
}
