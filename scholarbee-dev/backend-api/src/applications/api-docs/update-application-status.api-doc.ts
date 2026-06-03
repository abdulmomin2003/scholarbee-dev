import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateApplicationStatusDto } from '../dto/update-application.dto';

export function UpdateApplicationStatusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update application status' }),
    ApiParam({ name: 'applicationId', required: true, type: String }),
    ApiBody({
      type: UpdateApplicationStatusDto,
      examples: {
        default: {
          value: { status: 'UnderReview' },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated status', schema: { example: { _id: '651234abcd5678ef9012cdf0', status: 'UnderReview' } } }),
  );
}


