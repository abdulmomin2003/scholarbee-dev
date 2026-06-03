import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { DiscoveryInfoDto } from 'src/reference-system/dto/discovery-info.dto';

export class SignupDto extends CreateUserDto {
    @IsOptional()
    @ValidateNested() // validates nested objects
    @Type(() => DiscoveryInfoDto)
    discovery_info?: DiscoveryInfoDto;
}
