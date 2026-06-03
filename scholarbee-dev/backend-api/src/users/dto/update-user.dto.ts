import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserNS } from '../schemas/user.schema';
import {
  ArrayUnique,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { MarksPercentOrderConstraint } from 'src/common/validators/marks-percent-order.validator';
import { FeeRangeOrderConstraint } from 'src/common/validators/fee-range-order.validator';

function percentOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

class OnboardingRangeValueDto implements UserNS.IOnboardingRangeValue {
  @IsOptional()
  @Transform(({ value }) => percentOrNull(value))
  @ValidateIf((_o, v) => v !== null)
  @IsNumber()
  @Min(0)
  min?: number | null;

  @IsOptional()
  @Transform(({ value }) => percentOrNull(value))
  @ValidateIf((_o, v) => v !== null)
  @Validate(FeeRangeOrderConstraint)
  @IsNumber()
  @Min(0)
  max?: number | null;
}

class OnboardingMarksRangeDto implements UserNS.IOnboardingMarksRange {
  @IsOptional()
  @Transform(({ value }) => percentOrNull(value))
  @IsNumber()
  @Min(0)
  @Max(100)
  min_percent?: number | null;

  @IsOptional()
  @Transform(({ value }) => percentOrNull(value))
  @Validate(MarksPercentOrderConstraint)
  @IsNumber()
  @Min(0)
  @Max(100)
  max_percent?: number | null;
}

class OnboardingStartTimelineDto implements UserNS.IOnboardingStartTimeline {
  @IsOptional()
  @IsIn([...Object.values(UserNS.OnboardingStartTimelineType), null])
  type?: UserNS.OnboardingStartTimelineType | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  selected_at?: Date;
}

class OnboardingPreferencesDto implements UserNS.IOnboardingPreferences {
  @IsOptional()
  @IsIn([
    ...Object.values(UserNS.OnboardingDegreeGoal),
    null,
  ])
  degree_goal?: UserNS.OnboardingDegreeGoal | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  preferred_cities?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  preferred_fields_of_study?: string[];

  @IsOptional()
  /**
   * Why `plainToInstance(...)` here?
   *
   * We run global validation with `transform: true`, `whitelist: true`, and
   * `forbidNonWhitelisted: true` (see `src/main.ts`).
   *
   * When a nested object field is sent as `null` (e.g. `previous_marks_range: null`),
   * we want to treat it as "clear the inner bounds" by converting it to an object
   * with explicit `null` properties.
   *
   * However, if we return a *plain object* from `@Transform()`, it can end up being
   * validated as a raw object (instead of an instance of the DTO class), which
   * triggers whitelist errors like:
   * - `onboarding_preferences.previous_marks_range.property min_percent should not exist`
   *
   * `plainToInstance(DtoClass, value)` ensures the result is a proper DTO instance,
   * so `class-validator` can apply the nested DTO's decorators and whitelist rules.
   */
  @Transform(
    ({ value }) =>
      value === null
        ? plainToInstance(OnboardingRangeValueDto, { min: null, max: null })
        : value,
    { toClassOnly: true },
  )
  @ValidateNested()
  @Type(() => OnboardingRangeValueDto)
  semester_fee_range?: OnboardingRangeValueDto | null;

  @IsOptional()
  @Transform(
    ({ value }) =>
      value === null
        ? plainToInstance(OnboardingMarksRangeDto, {
            min_percent: null,
            max_percent: null,
          })
        : value,
    { toClassOnly: true },
  )
  @ValidateIf((_o, v) => v !== null)
  @ValidateNested()
  @Type(() => OnboardingMarksRangeDto)
  previous_marks_range?: OnboardingMarksRangeDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingStartTimelineDto)
  start_timeline?: OnboardingStartTimelineDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}

// Omit email from CreateUserDto to prevent email updates
export class UpdateUserDto extends
  PartialType(
    OmitType(CreateUserDto, ['email', 'password']),
  ) {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_of_birth?: Date;

  @IsOptional()
  @IsString()
  father_name?: string;

  @IsOptional()
  @IsString()
  father_profession?: string;

  @IsOptional()
  @IsEnum(['alive', 'deceased'])
  father_status?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{1,12}$/, {
    message: 'Father income must be a number not exceeding 999,999,999,999',
  })
  father_income?: string | null;

  @IsOptional()
  @IsString()
  mother_name?: string;

  @IsOptional()
  @IsString()
  mother_profession?: string;

  @IsOptional()
  @IsEnum(['alive', 'deceased'])
  mother_status?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{1,12}$/, {
    message: 'Mother income must be a number not exceeding 999,999,999,999',
  })
  mother_income?: string | null;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsEnum(['yes', 'no'])
  special_person?: string;

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  fatherEmailAddress?: string;

  @IsOptional()
  @IsString()
  fatherPhoneNumber?: string;

  @IsOptional()
  @IsEnum(UserNS.ProvinceOfDomicile)
  provinceOfDomicile?: UserNS.ProvinceOfDomicile;

  @IsOptional()
  @IsString()
  districtOfDomicile?: string;

  @IsOptional()
  @IsString()
  stateOrProvince?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  profile_image_url?: string;

  @IsOptional()
  @IsBoolean()
  isProfileCompleted?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  current_stage?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingPreferencesDto)
  onboarding_preferences?: OnboardingPreferencesDto;
}