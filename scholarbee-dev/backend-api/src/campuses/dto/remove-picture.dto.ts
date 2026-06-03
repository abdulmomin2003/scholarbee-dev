import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class RemovePictureDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  index?: number;

  // At least one of url or index must be provided
  // This will be validated in the service/controller
}

