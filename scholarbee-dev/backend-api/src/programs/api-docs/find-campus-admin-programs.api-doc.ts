import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CampusAdminProgramsResponseDto } from '../dto/campus-admin-programs-response.dto';
import { CampusAdminProgramStatusFilterEnum } from '../dto/query-campus-admin-programs.dto';

export function FindCampusAdminProgramsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get campus admin programs dashboard',
      description: 'Retrieve programs for the authenticated campus admin with status information (live, expired, on_hold, deleted). Only accessible by Campus Admins.',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search by program name/title',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: CampusAdminProgramStatusFilterEnum,
      description: 'Filter by program status: all, live, expired, on_hold, or deleted',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Page number (default: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Number of items per page (default: 10)',
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated programs for campus admin dashboard with status information',
      type: CampusAdminProgramsResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Campus Admin access required',
    }),
  );
}

