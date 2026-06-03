import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

export function GetAdmissionProgramByIdApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Get a single admission program by ID' }),
        ApiParam({
            name: 'admission_program_id',
            description: 'Admission program id',
            type: String,
        }),
    );
}