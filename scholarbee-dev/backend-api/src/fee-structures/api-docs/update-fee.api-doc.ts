import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateFeeDto } from '../dto/update-fee-structure.dto';

export function UpdateFeeApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update fee structure (admin)' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      type: UpdateFeeDto,
      examples: {
        default: {
          value: {
            tuition_fee: 155000,
            currency: 'PKR',
            other_fees: [
              { fee_name: 'IT Fee', fee_amount: 1500 },
            ],
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated fee structure', schema: { example: { _id: '6512fee01', tuition_fee: 155000 } } }),
  );
}


