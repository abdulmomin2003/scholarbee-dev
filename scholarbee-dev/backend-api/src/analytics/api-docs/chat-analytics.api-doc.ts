import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ChatConversationsPerCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Chat conversations per campus' }),
    ApiResponse({ status: 200, description: 'Counts per campus', schema: { example: [{ campusId: 'c1', conversations: 42 }] } }),
  );
}

export function ChatConversationsPerUniversityApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Chat conversations per university' }),
    ApiResponse({ status: 200, description: 'Counts per university', schema: { example: [{ universityId: 'u1', conversations: 84 }] } }),
  );
}

export function ChatResponseForCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Chat response metrics for a campus' }),
    ApiParam({ name: 'campusId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Response metrics', schema: { example: { avgResponseTimeMs: 1200 } } }),
  );
}

export function ChatResponseForUniversityApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Chat response metrics for a university' }),
    ApiParam({ name: 'universityId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Response metrics', schema: { example: { avgResponseTimeMs: 900 } } }),
  );
}

export function ChatResponseAllUniversitiesApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Chat response metrics for all universities' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiResponse({ status: 200, description: 'Top universities by response metrics', schema: { example: [{ universityId: 'u1', avgResponseTimeMs: 900 }] } }),
  );
}

export function ChatResponseAllCampusesApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Chat response metrics for all campuses' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiResponse({ status: 200, description: 'Top campuses by response metrics', schema: { example: [{ campusId: 'c1', avgResponseTimeMs: 1100 }] } }),
  );
}


