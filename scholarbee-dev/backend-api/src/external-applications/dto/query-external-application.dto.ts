import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryExternalApplicationDto extends PaginationDto {
  // Add time range filter
  @IsOptional()
  @IsIn(['weekly', 'monthly'])
  time_range?: 'weekly' | 'monthly';

  // Add filter fields with explicit Object ID naming
  @IsOptional()
  @IsString()
  programId?: string; // Object ID for program

  @IsOptional()
  @IsString()
  universityId?: string; // Object ID for university

  @IsOptional()
  @IsString()
  campusId?: string; // Object ID for campus
}
