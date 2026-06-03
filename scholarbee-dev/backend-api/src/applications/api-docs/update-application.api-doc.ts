import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateApplicationDto } from '../dto/update-application.dto';

export function UpdateApplicationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update application' }),
    ApiParam({ name: 'applicationId', required: true, type: String }),
    ApiBody({
      type: UpdateApplicationDto,
      examples: {
        default: {
          value: {
            is_submitted: true,
            total_processing_fee: 2500,
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated application', schema: { example: { _id: '651234abcd5678ef9012cdf0', status: 'Pending', is_submitted: true } } }),
  );
}


