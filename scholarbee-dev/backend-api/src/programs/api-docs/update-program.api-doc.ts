import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateProgramDto } from '../dto/update-program.dto';

export function UpdateProgramApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update program (admin)', description: 'Update program fields by ID. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      type: UpdateProgramDto,
      examples: {
        default: {
          value: {
            name: 'Bachelor of Computer Science (Updated)',
            major: 'Computer Science & Engineering',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated program', schema: { example: { _id: '651234abcd5678ef9012p001', name: 'Bachelor of Computer Science (Updated)' } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

