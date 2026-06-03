import { Type } from 'class-transformer';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ProgramDurationEnum } from '../schemas/program.schema';
import { IsObjectId } from 'nestjs-object-id';
import { CampusAdminProgramStatusFilterEnum } from './query-campus-admin-programs.dto';

/**
 * DTO for academic department in campus admin programs response
 */
export class CampusAdminAcademicDepartmentDto {
    @ApiProperty({ description: 'Academic department ID' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'Academic department name' })
    @IsString()
    name: string;
}

/**
 * DTO for a single program in campus admin dashboard
 */
export class CampusAdminProgramDto {
    @ApiProperty({ description: 'Program ID' })
    @IsObjectId()
    _id: Types.ObjectId;

    @ApiProperty({ description: 'Program name' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Academic department information' })
    @IsOptional()
    @Type(() => CampusAdminAcademicDepartmentDto)
    academic_departments?: CampusAdminAcademicDepartmentDto;

    @ApiProperty({ description: 'Program duration' })
    @IsString()
    duration: ProgramDurationEnum;

    @ApiPropertyOptional({ description: 'Credit hours required' })
    @IsOptional()
    @IsNumber()
    credit_hours?: number;

    @ApiProperty({ description: 'Mode of study' })
    @IsString()
    mode_of_study: string;

    @ApiPropertyOptional({
        description: 'Intake periods available for this program (e.g., ["Fall", "Spring"])',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    intake_periods?: string[];

    @ApiProperty({
        description: 'Program status (live, expired, on_hold, or deleted)',
        enum: CampusAdminProgramStatusFilterEnum,
        enumName: 'CampusAdminProgramStatusFilterEnum',
    })
    @IsEnum(CampusAdminProgramStatusFilterEnum, {
        message: 'Status must be one of: live, expired, on_hold, deleted',
    })
    status: Exclude<
        CampusAdminProgramStatusFilterEnum,
        CampusAdminProgramStatusFilterEnum.ALL
    >;
}

/**
 * DTO for pagination metadata
 */
export class CampusAdminPaginationMetaDto {
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
 * Response DTO for campus admin programs dashboard endpoint
 */
export class CampusAdminProgramsResponseDto {
    @ApiProperty({
        description: 'List of programs for the campus admin',
        type: [CampusAdminProgramDto],
    })
    @Type(() => CampusAdminProgramDto)
    programs: CampusAdminProgramDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        type: CampusAdminPaginationMetaDto,
    })
    @Type(() => CampusAdminPaginationMetaDto)
    meta: CampusAdminPaginationMetaDto;
}

