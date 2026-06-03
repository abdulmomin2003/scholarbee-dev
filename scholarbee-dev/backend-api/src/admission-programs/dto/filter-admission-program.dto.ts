import { IsOptional, IsString, IsNumber, MinLength, IsEnum, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { DegreeLevelEnum, AdmissionProgramStatusEnum } from 'src/common/constants/shared.constants';

export class FilterAdmissionProgramDto {
  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_fee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_fee?: number;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  intake?: string;

  @IsOptional()
  @IsString()
  session_term?: string;

  @IsOptional()
  @IsString()
  programName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  university?: string;

  @IsOptional()
  @IsEnum(DegreeLevelEnum)
  degree_level?: DegreeLevelEnum;

  @IsOptional()
  @IsString()
  courseForm?: string;

  @IsOptional()
  @IsString()
  campusId?: string;

  // Area filters (exact match)
  // Note: When provided along with 'area', these filters override/narrow the area search
  // for their respective fields (area uses fuzzy matching, these use exact matching)
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Generic area search (searches city/state/country/complete_address in ES with fuzzy matching)
  // Note: If specific city/state/country filters are also provided, those exact-match filters
  // will override/narrow the area search for their respective fields
  @IsOptional()
  @IsString()
  area?: string;

  // ============================================================================
  // PRIMITIVE FILTERS - Frontend-driven pseudo-state construction
  // ============================================================================
  // These three filters allow the frontend to construct their own pseudo-states
  // (Open, Closing Soon, Opening Soon, Closed, etc.) instead of relying on
  // backend-computed status enums. Frontend is responsible for combining these
  // primitive parameters to resolve the UI state they want to display.
  //
  // Examples:
  // - Open: receiving_applications=true + admission_enddate > now
  // - Closed: admission_enddate < now
  // - Closing Soon: admission_enddate > now AND < (now + 10 days)
  // - Opening Soon: admission_startdate > now AND < (now + 15 days)

  @IsOptional()
  @IsIn(['true', 'false'])
  receiving_applications?: string;

  @IsOptional()
  @IsDateString()
  admission_startdate_from?: string;

  @IsOptional()
  @IsDateString()
  admission_startdate_to?: string;

  @IsOptional()
  @IsDateString()
  admission_enddate_from?: string;

  @IsOptional()
  @IsDateString()
  admission_enddate_to?: string;

  // ============================================================================
  // LEGACY STATUS FILTER - Deprecated in favor of primitive filters above
  // ============================================================================
  // @deprecated Use receiving_applications + admission_startdate/admission_enddate
  // filters instead. Frontend should construct pseudo-states from primitive parameters.
  @IsOptional()
  @IsEnum(AdmissionProgramStatusEnum)
  status?: AdmissionProgramStatusEnum;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}