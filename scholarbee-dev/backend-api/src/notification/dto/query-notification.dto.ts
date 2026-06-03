import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidBoolean } from 'src/auth/decorators/is-valid-boolean.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NotificationCategory } from '../schemas/notification.schema';

export namespace NotificationQuery {
  export enum Scope {
    GLOBAL = 'global',
    SPECIFIC = 'specific',
    ALL = 'all',
  }

  export enum ReadStatus {
    ANY = 'any',
    UNREAD = 'unread',
    READ = 'read',
  }
}

export class QueryNotificationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(NotificationQuery.Scope)
  scope?: NotificationQuery.Scope = NotificationQuery.Scope.SPECIFIC;

  @IsOptional()
  @IsEnum(NotificationQuery.ReadStatus)
  read_status?: NotificationQuery.ReadStatus =
    NotificationQuery.ReadStatus.UNREAD;

  @IsOptional()
  @IsValidBoolean()
  get_campus_notifications?: boolean = false;

  @IsOptional()
  @IsDateString(undefined, {
    message: 'created_at must be a valid ISO date string or timestamp'
  })
  created_at?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.toString().split(',').map(v => v.trim());
  })
  @IsEnum(NotificationCategory, { each: true })
  category?: NotificationCategory[];
}

// DTO for querying campus notifications (for campus admins)
export class QueryCampusNotificationDto extends QueryNotificationDto { }
