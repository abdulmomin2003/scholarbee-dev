import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateContactDto } from '../dto/update-contact.dto';

export function UpdateContactApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update contact (admin)' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      type: UpdateContactDto,
      examples: {
        default: {
          value: {
            message: 'Updated note for follow-up',
            is_scholarship: false,
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated contact', schema: { example: { _id: '651234abcd5678ef9012ct01', message: 'Updated note for follow-up' } } }),
  );
}


