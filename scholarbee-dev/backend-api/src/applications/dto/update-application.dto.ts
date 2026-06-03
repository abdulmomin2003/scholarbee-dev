import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { IsValidBoolean } from 'src/auth/decorators/is-valid-boolean.decorator';
import { CreateApplicationDto } from './create-application.dto';
import { ApplicationStatus } from '../schemas/application.schema';

export class UpdateApplicationDto extends PartialType(
  OmitType(CreateApplicationDto, ['admission_program_id'] as const)
) {
  @IsOptional()
  @IsValidBoolean()
  is_submitted?: boolean;
}

export class UpdateApplicationStatusDto {
  @IsIn([
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.UNDER_REVIEW
  ])
  status: Extract<
    ApplicationStatus,
    ApplicationStatus.APPROVED | ApplicationStatus.REJECTED | ApplicationStatus.UNDER_REVIEW
  >;
}
