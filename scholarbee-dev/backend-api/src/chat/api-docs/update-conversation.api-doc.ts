import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateConversationDto } from '../dto/update-conversation.dto';

export function UpdateConversationApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Update conversation' }),
        ApiParam({ name: 'id', required: true, type: String }),
        ApiBody({
            type: UpdateConversationDto,
            examples: {
                default: {
                    value: {
                        name: 'Admissions Q&A - Spring',
                        is_read_by_user: true,
                        _deleted: false, // not required. But keeping it for extra safety and explicitness
                    },
                },
            },
        }),
        ApiResponse({ status: 200, description: 'Updated conversation', schema: { example: { _id: '6512conv...', name: 'Admissions Q&A - Spring' } } }),
    );
}


