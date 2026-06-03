import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { TransformToBoolean } from 'src/common/transformers/boolean.transformer';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';

/**
 * Currently, we only support Bachelors, Masters, and Doctorate degree levels.
 * This can change in the future and we can remove the restriction here.
 */
type IAllowedDegreeLevels = Extract<keyof typeof DegreeLevelEnum, 'Bachelors' | 'Masters' | 'Doctorate'>;

// reduce the enum values to only the values that are allowed for the degreeLevel
const allowedDegreeLevels: IAllowedDegreeLevels[] = [
  DegreeLevelEnum.Bachelors,
  DegreeLevelEnum.Masters,
  DegreeLevelEnum.Doctorate,
];

export class QueryApplicantsByProgramDto {
  @IsOptional()
  @IsEnum(allowedDegreeLevels, { message: 'degreeLevel must be one of: Bachelors, Masters, Doctorate' })
  degreeLevel?: IAllowedDegreeLevels;

  @IsOptional()
  @TransformToBoolean()
  @IsBoolean()
  includeZeroApplicants?: boolean;
}
