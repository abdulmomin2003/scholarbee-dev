import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsOptional,
    ValidateIf,
} from 'class-validator';
import { UserNS } from 'src/users/schemas/user.schema';

export class DiscoveryInfoDto {
    @IsNotEmpty()
    @IsEnum(UserNS.DiscoveryMode)
    discovery_mode: UserNS.DiscoveryMode;

    @ValidateIf((o) => o.discovery_mode === UserNS.DiscoveryMode.Invitation)
    @IsNotEmpty()
    @IsString()
    invitation_code?: string;
}

