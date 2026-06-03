import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function RemoveProgramTemplateApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete program template (Super Admin)' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Program template deleted', schema: { example: { deleted: true } } }),
    ApiNotFoundResponse({ description: 'Program template not found' }),
  );
}
