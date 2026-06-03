import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';

export function GetProgramsStatisticsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Programs statistics' }),
    ApiResponse({ status: 200, description: 'Aggregated statistics', schema: { example: { total: 120, byDegreeLevel: { [DegreeLevelEnum.Bachelors]: 60, [DegreeLevelEnum.Masters]: 40, [DegreeLevelEnum.Doctorate]: 20 } } } }),
  );
}

