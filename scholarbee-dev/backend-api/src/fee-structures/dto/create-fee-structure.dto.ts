import {
    IsNumber,
    IsOptional,
    IsString,
    IsArray,
    ValidateNested,
    IsBoolean,
    IsEnum,
    ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    FeeType,
    PaymentType,
    SemesterApplicability,
    MigrationStatus,
} from '../schemas/fee-structure.schema';

// Legacy DTO for backward compatibility
export class OtherFeeDto {
    @IsString()
    fee_name: string;

    @IsNumber()
    fee_amount: number;

    @IsOptional()
    @IsBoolean()
    include_in_first_semester?: boolean;
}

// Note: ApplicableToDto kept for backward compatibility but should use flattened fields
// New structure uses residency_applicability and enrollment_applicability directly
export class ApplicableToDto {
    @IsOptional()
    @IsEnum(['national', 'international', 'both'])
    residency_status?: 'national' | 'international' | 'both';

    @IsOptional()
    @IsEnum(['full_time', 'part_time', 'both'])
    student_category?: 'full_time' | 'part_time' | 'both';
}

// New Fee Item DTO
export class FeeItemDto {
    @IsEnum(FeeType)
    type: FeeType;

    @ValidateIf((o) => o.type === FeeType.OTHER)
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsEnum(PaymentType)
    payment_type: PaymentType;

    @IsEnum(SemesterApplicability)
    semester_applicability: SemesterApplicability;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    specific_semesters?: number[];

    @IsOptional()
    @IsEnum(['national', 'international', 'both'])
    residency_applicability?: 'national' | 'international' | 'both';

    @IsOptional()
    @IsEnum(['full_time', 'part_time', 'both'])
    enrollment_applicability?: 'full_time' | 'part_time' | 'both';

    // Legacy field - kept for backward compatibility
    @IsOptional()
    @ValidateNested()
    @Type(() => ApplicableToDto)
    applicable_to?: ApplicableToDto;

    @IsOptional()
    @IsBoolean()
    is_mandatory?: boolean;
}

export class CreateFeeDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    program_id?: string;

    // Legacy fields (optional for backward compatibility)
    @IsOptional()
    @IsNumber()
    tuition_fee?: number;

    @IsOptional()
    @IsNumber()
    application_fee?: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    payment_schedule?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OtherFeeDto)
    other_fees?: OtherFeeDto[];

    // New fields
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FeeItemDto)
    fees?: FeeItemDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    _info_source?: string[];

    @IsOptional()
    @IsEnum(MigrationStatus)
    _migration_status?: MigrationStatus;

    @IsOptional()
    @IsBoolean()
    _needs_review?: boolean;

    @IsOptional()
    @IsString()
    createdBy?: string;
} 