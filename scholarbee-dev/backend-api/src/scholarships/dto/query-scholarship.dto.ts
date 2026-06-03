import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  DegreeLevelEnum,
  ScholarshipLocationEnum,
  ScholarshipStatusEnum,
  ScholarshipTypeEnum,
} from 'src/common/constants/shared.constants';
import { IsDateRangeValid } from 'src/common/validators/date-range.validator';
import { IsConditionallyValid } from 'src/common/validators/conditional-field.validator';

export enum ScholarshipDeadlineStatusEnum {
  Active = 'active',
  Expired = 'expired',
}

export class QueryScholarshipDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  scholarship_name?: string;

  @IsOptional()
  @IsEnum(ScholarshipTypeEnum)
  scholarship_type?: ScholarshipTypeEnum;

  @IsOptional()
  @IsEnum(DegreeLevelEnum)
  degree_level?: DegreeLevelEnum;

  @IsOptional()
  @IsEnum(ScholarshipLocationEnum)
  location?: ScholarshipLocationEnum;

  @IsOptional()
  @IsEnum(ScholarshipStatusEnum)
  status?: ScholarshipStatusEnum;

  @IsOptional()
  @IsString()
  campus_id?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsString()
  university_id?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsEnum(ScholarshipDeadlineStatusEnum)
  @IsConditionallyValid(
    {
      conflictingFields: ['deadline_from', 'deadline_to'],
    },
    {
      message:
        'deadline_status cannot be used with deadline_from or deadline_to parameters. Use either deadline_status OR custom date range, not both.',
    },
  )
  deadline_status?: ScholarshipDeadlineStatusEnum;

  // * Application Deadline Date Range
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline_from?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @IsDateRangeValid('deadline_from', 'deadline_to', {
    message: 'deadline_from must be before or equal to deadline_to',
  })
  deadline_to?: Date;

  @IsOptional()
  @Type(() => Number)
  amountMin?: number;

  @IsOptional()
  @Type(() => Number)
  amountMax?: number;

  @IsOptional()
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Boolean)
  populate?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favouriteBy?: string[];
}
