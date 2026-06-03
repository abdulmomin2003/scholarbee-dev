import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Types } from 'mongoose';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { IsObjectId } from 'src/common/validators/object-id.validator';

// Simple inline validator for checking first preference matches top-level admission_program_id
@ValidatorConstraint({ name: 'firstPreferenceMatchesTopLevel', async: false })
class FirstPreferenceMatchesTopLevelConstraint
  implements ValidatorConstraintInterface {
  validate(preferences: PreferenceDto[], args: ValidationArguments) {
    const dto = args.object as CreateApplicationDto;
    return (
      dto.admission_program_id &&
      Array.isArray(preferences) &&
      preferences.length > 0 &&
      preferences[0]?.admission_program_id?.toString() === dto.admission_program_id.toString()
    );
  }

  defaultMessage() {
    return '1st preference must have the same admission_program_id as the top-level one';
  }
}

/**
 * Preference DTO for application department preferences.
 */
class PreferenceDto {
  /**
   * Admission Program ID - required field.
   * This references an AdmissionProgram document.
   */
  @IsNotEmpty({ message: 'admission_program_id is required' })
  @IsObjectId({
    message: 'admission_program_id must be a valid MongoDB ObjectId',
  })
  @ToObjectId()
  admission_program_id: Types.ObjectId;

  @IsString()
  @IsEnum(['1st', '2nd', '3rd'])
  preference_order: string;
}

export class CreateApplicationDto {

  @IsObjectId({ message: 'admission_program_id must be a valid MongoDB ObjectId' })
  @ToObjectId()
  admission_program_id: Types.ObjectId;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  total_processing_fee?: number = 1000;

  @IsOptional()
  @IsArray()
  @IsObjectId({ each: true })
  @ToObjectId()
  accepted_legal_documents?: Types.ObjectId[];

  /**
   * Admission Program Preferences
   * The 1st preference must have the same admission_program_id as the top-level one.
   */
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one preference is required' })
  @ValidateNested({ each: true })
  @Type(() => PreferenceDto)
  @Validate(FirstPreferenceMatchesTopLevelConstraint)
  preferences: PreferenceDto[];
}