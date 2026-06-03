import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';

export class MarksGPADto {
  @IsNotEmpty()
  @IsString()
  total_marks_gpa: string;

  @IsNotEmpty()
  @IsString()
  obtained_marks_gpa: string;
}

export class CreateEducationalBackgroundDto {
  // education_level - REQUIRED
  @IsNotEmpty()
  @IsEnum(DegreeLevelEnum)
  education_level: DegreeLevelEnum;

  // school_college_university - OPTIONAL
  @IsOptional()
  @IsString()
  school_college_university?: string;

  // field_of_study - OPTIONAL
  @IsOptional()
  @IsString()
  field_of_study?: string;

  // marks_gpa - REQUIRED
  @IsNotEmpty()
  @IsObject()
  marks_gpa: MarksGPADto;

  // year_of_passing - OPTIONAL
  @IsOptional()
  @IsString()
  year_of_passing?: string;

  // board - CONDITIONAL
  @ValidateIf(
    (o) =>
      o.education_level === DegreeLevelEnum.Matriculation ||
      o.education_level === DegreeLevelEnum.IntermediateFScFA,
  )
  @IsNotEmpty({
    message: `Board is required for these education levels: ${DegreeLevelEnum.Matriculation}, ${DegreeLevelEnum.IntermediateFScFA}`,
  })
  @IsString()
  board?: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl({ require_protocol: true })
  transcript: string;
}
