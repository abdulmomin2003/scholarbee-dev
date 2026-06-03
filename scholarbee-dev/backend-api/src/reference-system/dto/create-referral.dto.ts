import {
    IsNotEmpty,
    IsString,
    IsEnum,
    MaxLength,
    MinLength,
    IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ReferralType } from '../schemas/referral.schema';

export class CreateReferralDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    code?: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
    title: string;

    @IsNotEmpty()
    @IsEnum(ReferralType)
    type: ReferralType;
}

