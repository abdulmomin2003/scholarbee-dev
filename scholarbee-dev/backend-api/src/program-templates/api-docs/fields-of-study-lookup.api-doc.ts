import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FieldsOfStudyLookupProgramTemplateApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get all fields of study',
            description: `
Returns unique fields of study from program templates, sorted alphabetically.

**Scenarios:**

| Params | Behaviour |
|--------|-----------|
| _(none)_ | All fields of study across every program template in the database |
| \`admission_programs_available=true\` | Only fields of study for templates reachable from at least one admission program |

**How \`admission_programs_available\` works:**
Starts from the AdmissionPrograms collection, traces forward through Programs to ProgramTemplates, and extracts unique \`field_of_study\` values. This guarantees the results reflect what is actually available for admission, not just what exists in the template catalogue.

**Examples:**
- All templates: \`GET /program-templates/lookup/fields-of-study\`
- Admission-available only: \`GET /program-templates/lookup/fields-of-study?admission_programs_available=true\`
            `.trim(),
        }),
        ApiQuery({
            name: 'admission_programs_available',
            required: false,
            type: Boolean,
            example: true,
            description:
                'When true, restricts results to fields of study for templates that have at least one active admission program. ' +
                'Uses a forward aggregation: AdmissionPrograms → Programs → ProgramTemplates.',
        }),
        ApiResponse({
            status: 200,
            description: 'Sorted list of unique fields of study',
            content: {
                'application/json': {
                    examples: {
                        allTemplates: {
                            summary: 'No params — every field of study across all program templates',
                            value: [
                                'Accounting',
                                'Artificial Intelligence',
                                'Business Administration',
                                'Computer Science',
                                'Data Science',
                                'Electrical Engineering',
                                'Medicine',
                                'Pharmacy',
                                'Software Engineering',
                            ],
                        },
                        admissionAvailable: {
                            summary: 'admission_programs_available=true — templates linked to at least one admission program',
                            value: [
                                'Business Administration',
                                'Computer Science',
                                'Electrical Engineering',
                                'Medicine',
                            ],
                        },
                    },
                },
            },
        }),
    );
}
