import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsObjectId } from 'src/common/validators/object-id.validator';
import { NotificationCategory } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

// DTO for global notification creation
export class CreateGlobalNotificationDto extends CreateNotificationDto {}

// DTO for specific users notification creation
export class CreateSpecificNotificationDto extends CreateNotificationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds: string[];
}

// DTO for marking notifications as read
export class MarkBulkNotificationsAsReadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsObjectId({
    each: true,
    message: 'Each notification ID must be a valid MongoDB ObjectId',
  })
  notificationIds: string[];
}

// DTO for marking all notifications as read
export class MarkAllNotificationsAsReadDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.toString().split(',').map(v => v.trim());
  })
  @IsEnum(NotificationCategory, { each: true })
  category?: NotificationCategory[];
}

// DTO for validating notificationId as a param
export class MarkNotificationAsReadDto {
  @IsString()
  @IsNotEmpty()
  @IsObjectId({ message: 'Notification ID must be a valid MongoDB ObjectId' })
  notificationId: string;
}

// DTO for creating a campus global notification
export class CreateCampusGlobalNotificationDto extends CreateNotificationDto {
  // @IsObjectId({ message: 'Campus ID must be a valid MongoDB ObjectId' })
  // @IsNotEmpty()
  // campusId: string;
}

// DTO for creating a notification for specific campuses
export class CreateCampusSpecificNotificationsDto extends CreateNotificationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsObjectId({
    each: true,
    message: 'Each campus ID must be a valid MongoDB ObjectId',
  })
  campusIds: string[];
}

export class CreateAdmissionProgramNotificationDto {
  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}

export class CreateScholarshipNotificationDto {
  @IsString()
  @IsNotEmpty()
  scholarshipId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campusIds?: string[];
}

export class CreateApplicationStatusNotificationDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class CreateCampusNotificationDto {
  @IsString()
  @IsNotEmpty()
  campusId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campusIds?: string[];
}

export class CreateProgramNotificationDto {
  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campusIds?: string[];
}

export class CreateChatNotificationDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class CreateBlogPostNotificationDto {
  @IsString()
  @IsNotEmpty()
  blogPostId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}
