import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { AdmissionSessionEnum } from 'src/admissions/schemas/admission.schema';

export class AdmissionProgramDetailListQueryDto {
  /**
   * @deprecated Use `campus_slug` instead.
   */
  @ApiPropertyOptional({
    description:
      '**Deprecated.** Use `campus_slug` instead. ' +
      'University slug to filter by. When provided without `campus_slug`, the slug is resolved ' +
      'internally to the matching campus(es). Support for this parameter will be removed in a future release.',
    example: 'national-university-of-sciences-and-technology',
    deprecated: true,
  })
  @IsString()
  @IsOptional()
  university_slug?: string;

  @ApiPropertyOptional({
    description:
      'Campus slug to filter by. This is the preferred replacement for the deprecated `university_slug`. ' +
      'When both are provided, `campus_slug` takes priority.',
    example: 'nust-main-campus-islamabad',
  })
  @IsString()
  @IsOptional()
  campus_slug?: string;

  @ApiPropertyOptional({
    description:
      '**Deprecated.** The field of study / discipline (e.g., "Computer Science", "Electrical Engineering"). ' +
      'This does NOT refer to the program name (e.g., "BS Computer Science"). ' +
      'Use `seo_title_key` for more precise lookups.',
    example: 'Computer Science',
    deprecated: true,
  })
  @IsString()
  @IsOptional()
  major?: string;

  @ApiPropertyOptional({
    description:
      'SEO-friendly title key of the program template. ' +
      'Provides a more precise lookup than the major + degree_level combination.',
    example: 'bs-computer-science',
  })
  @IsString()
  @IsOptional()
  seo_title_key?: string;

  @ApiProperty({
    description: 'Degree level (e.g., Bachelors, Masters, Doctorate, Diploma)',
    example: 'Bachelors',
  })
  @IsString()
  @IsOptional()
  degree_level?: string;

  @ApiProperty({
    description: 'City name',
    example: 'Islamabad',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({
    description: 'Academic session term to filter by.',
    enum: AdmissionSessionEnum,
    example: AdmissionSessionEnum.FALL,
  })
  @IsEnum(AdmissionSessionEnum)
  @IsOptional()
  session_term?: AdmissionSessionEnum;

  @ApiPropertyOptional({
    description: 'Academic session year to filter by (e.g., 2025).',
    example: 2025,
    type: Number,
  })
  @IsNumber()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  @IsOptional()
  session_year?: number;

  @ApiPropertyOptional({
    description:
      'When true, ignores `session_year` and returns only records from the most recent available year ' +
      'for the matching program/campus combination. Useful for evergreen URLs that should always resolve ' +
      'to the current admission cycle without encoding the year in the frontend route.',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  only_latest_term_programs?: boolean;
}
