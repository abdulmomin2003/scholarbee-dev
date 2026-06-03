import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DegreeLevelEnum,
  ScholarshipLocationEnum,
  ScholarshipTypeEnum,
} from 'src/common/constants/shared.constants';
import { IsObjectId } from '../../common/validators/object-id.validator';

type AdmissionProgramNotificationWebhookDoc = {
  admission_program_id: string;
  admission_id: string;
  campus_id: string;
  campus_name: string;
  program_name: string;
  program_id: string;
};

type ScholarshipNotificationWebhookDoc = {
  scholarship_id: string;
  scholarship_name: string;
  scholarship_description: string;
  scholarship_type: ScholarshipTypeEnum;
  degree_level: DegreeLevelEnum;
  amount: number;
  campus_ids?: string[];
  university_id?: string;
  organization: { id: string; name: string };
  application_deadline: string;
};

/**
 * Simplified DTO for notification webhook data
 * Contains only the essential fields needed for notification processing
 *
 * ## TEMPLATE_MIGRATION_TODO
 * The `program_name` field is currently sourced directly from Program documents by the caller.
 * It should be sourced from ProgramTemplate.name once the notification caller is updated.
 */
export class AdmissionProgramNotificationWebhookDto
  implements AdmissionProgramNotificationWebhookDoc {
  @IsObjectId({
    message: 'admission_program_id must be a valid MongoDB ObjectId',
  })
  admission_program_id: string; // TODO: Verify if this is in fact an objectid

  @IsObjectId({
    message: 'admission_id must be a valid MongoDB ObjectId',
  })
  admission_id: string;

  @IsObjectId({
    message: 'campus_id must be a valid MongoDB ObjectId',
  })
  campus_id: string;

  @IsString()
  campus_name: string;

  @IsString()
  program_name: string;

  @IsObjectId({
    message: 'program_id must be a valid MongoDB ObjectId',
  })
  program_id: string;
}

/**
 * Nested DTO for organization info
 */
export class OrganizationInfo {
  @IsObjectId({
    message: 'organization id must be a valid MongoDB ObjectId',
  })
  id: string;

  @IsString()
  name: string;
}

/**
 * Simplified DTO for scholarship notification webhook data
 * Contains only the essential fields needed for notification processing
 */
export class ScholarshipNotificationWebhookDto
  implements ScholarshipNotificationWebhookDoc {
  @IsObjectId({
    message: 'scholarship_id must be a valid MongoDB ObjectId',
  })
  scholarship_id: string;

  @IsString()
  scholarship_name: string;

  @IsString()
  scholarship_description: string;

  @IsEnum(ScholarshipTypeEnum)
  scholarship_type: ScholarshipTypeEnum;

  @IsEnum(ScholarshipLocationEnum)
  location: ScholarshipLocationEnum;

  @IsEnum(DegreeLevelEnum)
  degree_level: DegreeLevelEnum;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsObjectId({
    each: true,
    message: 'campus_ids must be a valid MongoDB ObjectId',
  })
  campus_ids?: string[];

  @IsOptional()
  @IsObjectId({
    message: 'university_id must be a valid MongoDB ObjectId',
  })
  university_id?: string;

  @ValidateNested()
  @Type(() => OrganizationInfo)
  organization: { id: string; name: string };

  @IsString()
  application_deadline: string;
}
