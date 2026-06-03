import { IsOptional, IsString, IsNumber, IsDate, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { MigrationStatus } from '../schemas/fee-structure.schema';

export class QueryFeeDto {
    @IsOptional()
    @IsString()
    program_id?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minTuitionFee?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxTuitionFee?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minApplicationFee?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxApplicationFee?: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    payment_schedule?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    createdAtFrom?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    createdAtTo?: Date;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsArray()
    other_fees?: string[];

    @IsOptional()
    @IsString()
    createdBy?: string;

    // New fields for querying
    @IsOptional()
    @IsEnum(MigrationStatus)
    _migration_status?: MigrationStatus;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    _needs_review?: boolean;
} 