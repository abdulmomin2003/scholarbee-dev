import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompareProgramsDto } from '../dto/compare-programs.dto';

export function CompareProgramsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Compare programs', description: 'Compare multiple programs side by side.' }),
    ApiBody({
      type: CompareProgramsDto,
      examples: {
        default: {
          value: {
            programIds: ['651234abcd5678ef9012p001', '651234abcd5678ef9012p002', '651234abcd5678ef9012p003']
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Comparison result',
      schema: {
        example: {
          programs: [
            { _id: '651234abcd5678ef9012p001', name: 'Program A', fee: 150000 },
            { _id: '651234abcd5678ef9012p002', name: 'Program B', fee: 180000 }
          ]
        }
      }
    }),
  );
}

