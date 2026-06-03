import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserNS } from 'src/users/schemas/user.schema';
import { Types } from 'mongoose';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { IsObjectId } from 'src/common/validators/object-id.validator';

export class CreateUserDto {
  /**
   * Full name of the user. Preferred over first_name + last_name.
   * If omitted, first_name (and optionally last_name) must be provided instead.
   */
  @ApiPropertyOptional({ description: 'Full name. Use this instead of first_name + last_name.' })
  @IsOptional()
  @IsString()
  full_name?: string;

  /**
   * @deprecated Use full_name instead. Kept for backward compatibility.
   * If full_name is absent, first_name is concatenated with last_name to form full_name.
   */
  @ApiPropertyOptional({ deprecated: true, description: 'Deprecated. Use full_name instead.' })
  @IsOptional()
  @IsString()
  first_name?: string;

  /**
   * @deprecated Use full_name instead. Kept for backward compatibility.
   */
  @ApiPropertyOptional({ deprecated: true, description: 'Deprecated. Use full_name instead.' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsEnum([UserNS.UserType.Student])
  user_type: UserNS.UserType;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsObjectId()
  @ToObjectId()
  campus_id?: Types.ObjectId;

  /**
   * @deprecated No longer required. Accepted to avoid breaking existing clients but ignored.
   */
  @ApiPropertyOptional({ deprecated: true, description: 'Deprecated. No longer required or processed.' })
  @IsOptional()
  @IsArray()
  accepted_legal_documents?: unknown[];
}
