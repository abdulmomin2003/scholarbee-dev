import { IsString, IsNotEmpty } from 'class-validator';

export class AddPictureDto {
    @IsString()
    @IsNotEmpty()
    url: string;
}

