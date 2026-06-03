import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { ProgramDurationEnum, ModeOfStudyEnum } from '../schemas/program.schema';

/**
 * DTO for creating a new Program
 *
 * ## Template Reference
 * The `template` field is **required** and links the program to a ProgramTemplate
 * that provides: `name`, `degree_level`, `field_of_study`, and `tags`.
 *
 * The program's own `name`, `major`, and `degree_level` fields have been removed
 * from this DTO — they are now sourced exclusively from the referenced template
 * at query time.
 */
export class CreateProgramDto {
  /**
   * Optional SEO-friendly slug
   * If not provided, will be auto-generated from campus name and program name
   */
  @ApiPropertyOptional({
    description: 'SEO-friendly URL slug (auto-generated if not provided)',
    example: 'nust-main-computer-science',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Program duration',
    enum: ProgramDurationEnum,
    example: ProgramDurationEnum.Months_48,
  })
  @IsEnum(ProgramDurationEnum)
  @IsOptional()
  duration?: ProgramDurationEnum;

  @ApiPropertyOptional({
    description: 'Total credit hours required for the program',
    example: 130,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  credit_hours?: number;

  @ApiPropertyOptional({
    description: 'Language of instruction',
    example: 'English',
  })
  @IsString()
  @IsOptional()
  language_of_instruction?: string;

  @ApiPropertyOptional({
    description: 'Accreditations information',
    example: 'HEC, PEC',
  })
  @IsString()
  @IsOptional()
  accreditations?: string;

  @ApiPropertyOptional({
    description: 'Mode of study',
    enum: ModeOfStudyEnum,
    example: ModeOfStudyEnum.Onsite,
  })
  @IsEnum(ModeOfStudyEnum)
  @IsOptional()
  mode_of_study?: ModeOfStudyEnum;

  @ApiPropertyOptional({
    description: 'Available scholarship options',
    example: 'Merit-based scholarships available',
  })
  @IsString()
  @IsOptional()
  scholarship_options?: string;

  @ApiPropertyOptional({
    description: 'Sorting weight for display order',
    example: '1',
  })
  @IsString()
  @IsOptional()
  sorting_weight?: string;

  @ApiPropertyOptional({
    description: 'Academic department ID (MongoDB ObjectId)',
    example: '651234abcd5678ef9012dept1',
    type: String,
  })
  @IsObjectId({
    message: 'Academic department ID must be a valid MongoDB ObjectId',
  })
  @ToObjectId()
  @IsOptional()
  academic_departments?: Types.ObjectId;

  /**
   * Reference to the ProgramTemplate (required)
   *
   * Links this program to a template that provides:
   * - `name`: Canonical program name
   * - `degree_level`: Degree level
   * - `field_of_study`: Field of study (returned as both `field_of_study` and `major`)
   * - `tags`: Array of tags for filtering and categorization
   *
   * Note: ProgramTemplate.description is template-specific and NOT
   * intended for use in Program documents.
   */
  @ApiProperty({
    description: 'Program template ID (MongoDB ObjectId). name, degree_level, field_of_study, and tags are derived from this template.',
    example: '651234abcd5678ef9012template1',
    type: String,
  })
  @IsNotEmpty()
  @IsObjectId({ message: 'Program template ID must be a valid MongoDB ObjectId' })
  @ToObjectId()
  template: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Fee structure ID (MongoDB ObjectId)',
    example: '651234abcd5678ef9012fee1',
    type: String,
  })
  @IsOptional()
  @IsObjectId({ message: 'Fee structure ID must be a valid MongoDB ObjectId' })
  @ToObjectId()
  fee_structure?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Creation date (optional, defaults to current date)',
    example: '2025-01-01T12:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  created_at?: Date;
}
