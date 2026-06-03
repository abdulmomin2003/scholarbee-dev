import { Type } from 'class-transformer';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    IsObject,
    IsDateString,
    IsEnum,
    IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';
import { ProgramDurationEnum } from 'src/programs/schemas/program.schema';
import { IsObjectId } from 'nestjs-object-id';
import {
    FeeType,
    PaymentType,
    SemesterApplicability,
    MigrationStatus,
} from 'src/fee-structures/schemas/fee-structure.schema';

/**
 * DTO for intake period information
 */
export class IntakePeriodDto {
    @ApiProperty({ description: 'Intake period name (e.g., "Fall", "Spring")' })
    @IsString()
    intake_period: string;

    @ApiProperty({ description: 'Intake period ID' })
    @IsString()
    id: string;
}

/**
 * DTO for other fees in fee structure (legacy)
 */
export class OtherFeeDto {
    @ApiProperty({ description: 'Name of the fee' })
    @IsString()
    fee_name: string;

    @ApiProperty({ description: 'Amount of the fee' })
    @IsNumber()
    fee_amount: number;

    @ApiProperty({ description: 'Whether the fee is included in first semester' })
    @IsOptional()
    @IsString()
    include_in_first_semester?: boolean;

    @ApiProperty({ description: 'Fee ID' })
    @IsString()
    id: string;
}

/**
 * DTO for applicable_to in fee items (legacy - kept for backward compatibility)
 */
export class ApplicableToResponseDto {
    @ApiPropertyOptional({ description: 'Residency status this fee applies to' })
    @IsOptional()
    @IsEnum(['national', 'international', 'both'])
    residency_status?: 'national' | 'international' | 'both';

    @ApiPropertyOptional({ description: 'Student category this fee applies to' })
    @IsOptional()
    @IsEnum(['full_time', 'part_time', 'both'])
    student_category?: 'full_time' | 'part_time' | 'both';
}

/**
 * DTO for fee items in the new unified format
 */
export class FeeItemResponseDto {
    @ApiProperty({ description: 'Fee type', enum: FeeType })
    @IsEnum(FeeType)
    type: FeeType;

    @ApiPropertyOptional({ description: 'Custom name for the fee (required if type is OTHER)' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Description or notes about this fee' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Fee amount' })
    @IsNumber()
    amount: number;

    @ApiPropertyOptional({ description: 'Currency override for this fee item' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiProperty({ description: 'Payment type', enum: PaymentType })
    @IsEnum(PaymentType)
    payment_type: PaymentType;

    @ApiProperty({ description: 'Semester applicability', enum: SemesterApplicability })
    @IsEnum(SemesterApplicability)
    semester_applicability: SemesterApplicability;

    @ApiPropertyOptional({ description: 'Specific semester numbers (if semester_applicability is specific_semesters)' })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    specific_semesters?: number[];

    @ApiPropertyOptional({ description: 'Residency applicability', enum: ['national', 'international', 'both'] })
    @IsOptional()
    @IsEnum(['national', 'international', 'both'])
    residency_applicability?: 'national' | 'international' | 'both';

    @ApiPropertyOptional({ description: 'Enrollment applicability', enum: ['full_time', 'part_time', 'both'] })
    @IsOptional()
    @IsEnum(['full_time', 'part_time', 'both'])
    enrollment_applicability?: 'full_time' | 'part_time' | 'both';

    @ApiPropertyOptional({ description: 'Conditions for fee applicability (legacy - kept for backward compatibility)' })
    @IsOptional()
    @ValidateNested()
    @Type(() => ApplicableToResponseDto)
    applicable_to?: ApplicableToResponseDto;

    @ApiPropertyOptional({ description: 'Whether this fee is mandatory' })
    @IsOptional()
    @IsBoolean()
    is_mandatory?: boolean;
}

/**
 * DTO for fee structure information
 */
export class FeeStructureDto {
    @ApiProperty({ description: 'Fee structure ID' })
    @IsString()
    _id: Types.ObjectId;

    @ApiPropertyOptional({ description: 'Program ID this fee structure belongs to' })
    @IsOptional()
    @IsString()
    program_id?: string;

    @ApiProperty({ description: 'Fee structure title' })
    @IsString()
    title: string;

    // Legacy fields (optional for backward compatibility)
    @ApiPropertyOptional({ description: 'Tuition fee amount (legacy field)' })
    @IsOptional()
    @IsNumber()
    tuition_fee?: number;

    @ApiPropertyOptional({ description: 'Application fee amount (legacy field)' })
    @IsOptional()
    @IsNumber()
    application_fee?: number;

    @ApiPropertyOptional({ description: 'Currency code (e.g., "PKR", "USD")' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ description: 'Payment schedule information' })
    @IsOptional()
    @IsString()
    payment_schedule?: string;

    @ApiPropertyOptional({
        description: 'Other fees (legacy field) - can be an array of OtherFeeDto or a string',
        oneOf: [
            { type: 'array', items: { $ref: '#/components/schemas/OtherFeeDto' } },
            { type: 'string' },
        ],
    })
    @IsOptional()
    other_fees?: OtherFeeDto[] | string;

    // New fields
    @ApiPropertyOptional({
        description: 'Unified fee items array (new format)',
        type: [FeeItemResponseDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FeeItemResponseDto)
    fees?: FeeItemResponseDto[];

    @ApiPropertyOptional({ description: 'Information source URLs' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    _info_source?: string[];

    @ApiPropertyOptional({ description: 'Migration status', enum: MigrationStatus })
    @IsOptional()
    @IsEnum(MigrationStatus)
    _migration_status?: MigrationStatus;

    @ApiPropertyOptional({ description: 'Flag indicating if fee structure needs review' })
    @IsOptional()
    @IsBoolean()
    _needs_review?: boolean;

    @ApiProperty({ description: 'Creation date' })
    @IsDateString()
    created_at: string;

    @ApiPropertyOptional({ description: 'User ID who created this fee structure' })
    @IsOptional()
    @IsString()
    createdBy?: string;

    @ApiProperty({ description: 'Mongoose createdAt timestamp' })
    @IsDateString()
    createdAt: string;

    @ApiProperty({ description: 'Mongoose updatedAt timestamp' })
    @IsDateString()
    updatedAt: string;

    @ApiProperty({ description: 'Mongoose version key' })
    @IsNumber()
    __v: number;
}

/**
 * DTO for academic department information (nested in program)
 */
export class AcademicDepartmentDto {
    @ApiProperty({ description: 'Academic department ID' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'Academic department name' })
    @IsString()
    name: string;
}

/**
 * DTO for department information (from lookup)
 */
export class DepartmentDto {
    @ApiProperty({ description: 'Department ID' })
    @IsString()
    _id: string;

    @ApiPropertyOptional({ description: 'Campus ID this department belongs to' })
    @IsOptional()
    @IsString()
    campus_id?: string;

    @ApiProperty({ description: 'Department name' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Contact phone number' })
    @IsOptional()
    @IsString()
    contact_phone?: string;

    @ApiProperty({ description: 'Creation date' })
    @IsDateString()
    created_at: string;

    @ApiProperty({ description: 'Mongoose createdAt timestamp' })
    @IsDateString()
    createdAt: string;

    @ApiProperty({ description: 'Mongoose updatedAt timestamp' })
    @IsDateString()
    updatedAt: string;

    @ApiProperty({ description: 'Mongoose version key' })
    @IsNumber()
    __v: number;
}

/**
 * DTO for individual program in the response
 */
export class ProgramByCampusDto {
    @ApiProperty({ description: 'Program ID' })
    @IsObjectId()
    _id: Types.ObjectId;

    @ApiProperty({ description: 'Campus ID this program belongs to' })
    @IsObjectId()
    campus_id: Types.ObjectId;

    @ApiProperty({ description: 'Academic department information' })
    @ValidateNested()
    @Type(() => AcademicDepartmentDto)
    academic_departments: AcademicDepartmentDto;

    @ApiProperty({ description: 'Program name' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Program major' })
    @IsOptional()
    @IsString()
    major?: string;

    @ApiProperty({ description: 'Program duration' })
    @IsString()
    duration: string;

    @ApiPropertyOptional({ description: 'Credit hours required' })
    @IsOptional()
    @IsNumber()
    credit_hours?: number;

    @ApiProperty({ description: 'Degree level' })
    @IsString()
    degree_level: string;

    @ApiProperty({ description: 'Mode of study' })
    @IsString()
    mode_of_study: string;

    // @ApiProperty({ description: 'Language of instruction' })
    // @IsString()
    // language_of_instruction: string;

    // @ApiProperty({
    //     description: 'Intake periods available for this program',
    //     type: [IntakePeriodDto],
    // })
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => IntakePeriodDto)
    // intake_periods: IntakePeriodDto[];

    @ApiProperty({ description: 'Creation date' })
    @IsDateString()
    created_at: string;

    // @ApiProperty({ description: 'Mongoose createdAt timestamp' })
    // @IsDateString()
    // createdAt: string;

    // @ApiProperty({ description: 'Mongoose updatedAt timestamp' })
    // @IsDateString()
    // updatedAt: string;

    // @ApiProperty({ description: 'Mongoose version key' })
    // @IsNumber()
    // __v: number;

    @ApiPropertyOptional({ description: 'Accreditations information' })
    @IsOptional()
    @IsString()
    accreditations?: string;

    @ApiPropertyOptional({ description: 'Sorting weight for display order' })
    @IsOptional()
    @IsString()
    sorting_weight?: string;

    /**
     * Reference to the ProgramTemplate
     * 
     * Links this program to a template that provides:
     * - `name`: Canonical program name
     * - `degree_level`: Degree level
     * - `field_of_study`: Field of study (maps to Program.major)
     * - `tags`: Array of tags for filtering
     * 
     * @deprecated The name, degree_level, and major fields on Program are deprecated.
     * Use the template reference to get these values instead.
     */
    @ApiPropertyOptional({ description: 'Program template ID (MongoDB ObjectId). Use this to get name, degree_level, major, and tags.' })
    @IsOptional()
    @IsString()
    template?: string;

    @ApiPropertyOptional({
        description: 'Fee structure information',
        type: FeeStructureDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => FeeStructureDto)
    fee_structure?: FeeStructureDto;
}

/**
 * DTO for pagination metadata
 */
export class PaginationMetaDto {
    @ApiProperty({ description: 'Total number of programs' })
    @IsNumber()
    total: number;

    @ApiProperty({ description: 'Current page number' })
    @IsNumber()
    page: number;

    @ApiProperty({ description: 'Number of items per page' })
    @IsNumber()
    limit: number;

    @ApiProperty({ description: 'Total number of pages' })
    @IsNumber()
    totalPages: number;
}

/**
 * DTO for academic department in available filters
 */
export class AvailableFilterAcademicDepartmentDto {
    @ApiProperty({ description: 'Academic department ID' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'Academic department name' })
    @IsString()
    name: string;
}

/**
 * DTO for available filters
 */
export class AvailableFiltersDto {
    @ApiProperty({
        description: 'Available degree levels',
        type: [String],
        enum: DegreeLevelEnum,
    })
    @IsArray()
    @IsString({ each: true })
    degree_level: string[];

    @ApiProperty({
        description: 'Available durations',
        type: [String],
        enum: ProgramDurationEnum,
    })
    @IsArray()
    @IsString({ each: true })
    duration: string[];

    @ApiProperty({
        description: 'Available academic departments',
        type: [AvailableFilterAcademicDepartmentDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AvailableFilterAcademicDepartmentDto)
    academic_departments: AvailableFilterAcademicDepartmentDto[];
}

/**
 * Main response DTO for GET /programs/campus/:campusId endpoint
 */
export class ProgramsByCampusResponseDto {
    @ApiProperty({
        description: 'List of programs for the specified campus',
        type: [ProgramByCampusDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProgramByCampusDto)
    programs: ProgramByCampusDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        type: PaginationMetaDto,
    })
    @ValidateNested()
    @Type(() => PaginationMetaDto)
    meta: PaginationMetaDto;

    @ApiProperty({
        description: 'Available filters for further filtering',
        type: AvailableFiltersDto,
    })
    @ValidateNested()
    @Type(() => AvailableFiltersDto)
    availableFilters: AvailableFiltersDto;
}