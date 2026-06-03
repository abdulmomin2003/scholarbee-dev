import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

// file: src/admission-programs/api-docs/get-by-slug.api-doc.ts
export function GetAdmissionProgramBySlugApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Get a single admission program by slug' }),
        ApiParam({
            name: 'slug',
            description: 'Admission program slug',
            type: String,
        }),
    );
}