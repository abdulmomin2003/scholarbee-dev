import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProgramsByCampusResponseDto } from '../dto/programs-by-campus-response.dto';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';

export function FindProgramsByCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Find programs by campus', description: 'Retrieve programs for a specific campus. Authentication optional.' }),
    ApiParam({ name: 'campusId', required: true, type: String }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'name', required: false, type: String }),
    ApiQuery({ name: 'major', required: false, type: String }),
    ApiQuery({ name: 'duration', required: false, type: String, enum: ['12 Months', '18 Months', '24 Months', '36 Months', '48 Months', '60 Months'] }),
    ApiQuery({ name: 'mode_of_study', required: false, type: String }),
    ApiQuery({ name: 'university_id', required: false, type: String }),
    ApiQuery({ name: 'degree_level', required: false, type: String, enum: DegreeLevelEnum }),
    ApiQuery({ name: 'academic_departments', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: true }),
    ApiResponse({
      status: 200,
      description: 'Paginated programs for campus with available filters',
      type: ProgramsByCampusResponseDto,
    }),
  );
}

