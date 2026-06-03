import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

type LocationDetails = {
  complete_address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

/**
 * ## TEMPLATE_MIGRATION_TODO
 * The following fields are currently sourced directly from Program documents by the caller:
 * - `program_title` → should be sourced from ProgramTemplate.name
 * - `major` → should be sourced from ProgramTemplate.field_of_study
 * - `degree_level` → should be sourced from ProgramTemplate.degree_level
 *
 * Additionally, add `field_of_study` (string) and `tags` (string[]) fields
 * once the indexing caller is updated to resolve template fields.
 */
type RequiredAdmissionProgramIndexDoc = {
  doc_id: string;
  campus_image: string;
  location_details: LocationDetails;
  university_logo: string;
  program_title: string;
  study_mode: string; // onsite or online
  tuition_fee: number;
  university_id: string;
  university_name: string;
  campus_id: string;
  campus_name: string;
  campus_level: number; // Campus level field
  program_id: string;
  admission_id: string;
  degree_level: string;
  intake_period: string;
  admission_startdate?: string;
  admission_enddate?: string; // Using admission_deadline as end date
  major: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export class LocationDetailsDto implements LocationDetails {
  @IsString()
  @IsOptional()
  complete_address: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsNumber()
  @IsOptional()
  latitude: number;

  @IsNumber()
  @IsOptional()
  longitude: number;
}

export class AdmissionProgramIndexingWebhookDto
  implements RequiredAdmissionProgramIndexDoc {
  @IsString()
  @IsNotEmpty()
  doc_id: string;

  @IsString()
  campus_image: string;

  @ValidateNested()
  @Type(() => LocationDetailsDto)
  location_details: LocationDetailsDto;

  @IsString()
  university_logo: string;

  @IsString()
  @IsNotEmpty()
  program_title: string;

  @IsString()
  @IsNotEmpty()
  study_mode: string; // onsite or online

  @IsNumber()
  @IsNotEmpty()
  tuition_fee: number;

  @IsString()
  @IsNotEmpty()
  university_id: string;

  @IsString()
  @IsNotEmpty()
  university_name: string;

  @IsString()
  @IsNotEmpty()
  campus_id: string;

  @IsString()
  @IsNotEmpty()
  campus_name: string;

  @IsNumber()
  @IsNotEmpty()
  campus_level: number;

  @IsString()
  @IsNotEmpty()
  program_id: string;

  @IsString()
  @IsNotEmpty()
  admission_id: string;

  @IsString()
  @IsNotEmpty()
  degree_level: string;

  @IsString()
  @IsNotEmpty()
  intake_period: string;

  @IsString()
  @IsOptional()
  admission_startdate?: string;

  @IsString()
  @IsOptional()
  admission_enddate?: string; // Using admission_deadline as end date

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
