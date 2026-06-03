import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateConversationDto } from '../dto/create-conversation.dto';

export function CreateConversationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create conversation', description: 'Create a new conversation for the authenticated user.' }),
    ApiBody({
      type: CreateConversationDto,
      examples: {
        default: {
          value: {
            name: 'Admissions Q&A',
            campus_id: '651234abcd5678ef9012camp',
            type: 'support',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Conversation created', schema: { example: { _id: '651234abcd5678ef9012conv', name: 'Admissions Q&A' } } }),
  );
}


