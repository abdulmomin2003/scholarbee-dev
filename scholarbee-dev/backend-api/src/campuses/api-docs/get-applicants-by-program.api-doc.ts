import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';

export function GetApplicantsByProgramApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get applicant statistics by program for a campus',
      description:
        'Returns the count of submitted applications (status != DRAFT) grouped by program for a specific campus. Optionally filter by degree level. Returns all programs if degreeLevel is not provided. Requires authentication. Only accessible by campus admins.',
    }),
    ApiParam({
      name: 'campusId',
      required: true,
      type: String,
      description: 'The campus ID',
    }),
    ApiQuery({
      name: 'degreeLevel',
      required: false,
      enum: [
        DegreeLevelEnum.Bachelors,
        DegreeLevelEnum.Masters,
        DegreeLevelEnum.Doctorate,
      ],
      description: 'Optional degree level to filter by. If not provided, returns all programs regardless of degree level.',
      example: DegreeLevelEnum.Bachelors,
    }),
    ApiQuery({
      name: 'includeZeroApplicants',
      required: false,
      type: Boolean,
      description: 'If `true`, includes programs with 0 applicants in the results. Defaults to false.',
      example: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Applicant statistics by program',
      schema: {
        example: {
          totalApplicantCount: 809,
          totalProgramCount: 10,
          programs: [
            {
              programId: '507f1f77bcf86cd799439011',
              programName: 'BS Computer Science',
              applicantCount: 150,
              degreeLevel: 'Bachelors',
            },
            {
              programId: '507f1f77bcf86cd799439012',
              programName: 'BS Physics',
              applicantCount: 56,
              degreeLevel: 'Bachelors',
            },
            {
              programId: '507f1f77bcf86cd799439013',
              programName: 'BS Mathematics',
              applicantCount: 45,
              degreeLevel: 'Bachelors',
            },
          ],
          campusId: '507f1f77bcf86cd799439010',
          generatedAt: '2025-11-06T15:20:31.000Z',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid authentication',
    }),
    ApiBadRequestResponse({
      description: 'Invalid degreeLevel enum value or invalid campus ID',
    }),
    ApiForbiddenResponse({
      description: 'User is not a campus admin or does not have access to this campus',
    }),
    ApiNotFoundResponse({
      description: 'Campus not found',
    }),
  );
}

