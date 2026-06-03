import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFeeDto } from '../dto/create-fee-structure.dto';

export function CreateFeeApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create fee structure (admin)' }),
    ApiBody({
      type: CreateFeeDto,
      examples: {
        default: {
          value: {
            program_id: '651234abcd5678ef9012p001',
            tuition_fee: 150000,
            application_fee: 5000,
            currency: 'PKR',
            payment_schedule: 'per semester',
            other_fees: [
              { fee_name: 'Lab Fee', fee_amount: 3000, include_in_first_semester: true },
              { fee_name: 'Library Fee', fee_amount: 1000 },
            ],
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Fee structure created', schema: { example: { _id: '6512fee01', program_id: '651234abcd5678ef9012p001' } } }),
  );
}


