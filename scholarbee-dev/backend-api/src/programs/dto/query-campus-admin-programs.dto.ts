import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * Enum for campus admin program status filter
 * Used to filter programs in the campus admin dashboard
 * - ALL: Show all programs (excluding soft-deleted by default)
 * - LIVE: Programs with at least one admission program that has a future deadline
 * - EXPIRED: Programs where all associated admission programs have expired deadlines
 * - ON_HOLD: Programs with no associated admission programs or all admission programs lack deadlines
 * - DELETED: Soft-deleted programs
 */
export enum CampusAdminProgramStatusFilterEnum {
    ALL = 'all',
    LIVE = 'live',
    EXPIRED = 'expired',
    ON_HOLD = 'on_hold',
    DELETED = 'deleted',
}

export class QueryCampusAdminProgramsDto extends PaginationDto {
    /**
     * Search by program name/title
     */
    @IsOptional()
    @IsString()
    search?: string;

    /**
     * Filter by program status
     * - all: All programs (excluding deleted by default)
     * - live: Programs with at least one admission program that has a future deadline
     * - expired: Programs where all associated admission programs have expired deadlines
     * - on_hold: Programs with no associated admission programs or all admission programs lack deadlines
     * - deleted: Soft-deleted programs
     */
    @IsOptional()
    @IsEnum(CampusAdminProgramStatusFilterEnum)
    status?: CampusAdminProgramStatusFilterEnum;
}

