import {
  IsOptional,
  IsString,
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PopulateDto } from 'src/common/dto/populate.dto';
import { IsObjectId } from 'src/common/validators/object-id.validator';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { Types } from 'mongoose';

export class QueryAdmissionProgramDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  admission?: string;

  @IsOptional()
  @IsMongoId()
  program?: string;

  @IsOptional()
  @IsArray()
  @IsObjectId({ each: true })
  @ToObjectId()
  favouriteBy?: Types.ObjectId[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAvailableSeats?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxAvailableSeats?: number;

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

export class QueryAdmissionProgramByIdDto extends PopulateDto { }
