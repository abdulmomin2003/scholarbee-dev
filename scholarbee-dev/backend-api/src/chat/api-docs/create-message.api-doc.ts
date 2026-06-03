import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateMessageDto } from '../dto/create-message.dto';

export function CreateUserMessageApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create user message' }),
    ApiBody({
      type: CreateMessageDto,
      examples: {
        default: {
          value: {
            conversation_id: '6512conv...',
            content: 'Hello, I need help with admissions.',
            attachments: [],
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Message created', schema: { example: { _id: '6512msg...', content: 'Hello, I need help with admissions.' } } }),
  );
}

export function CreateCampusMessageApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create campus message (admin only)' }),
    ApiBody({
      type: CreateMessageDto,
      examples: {
        default: {
          value: {
            conversation_id: '6512conv...',
            content: 'Thanks for reaching out. Please provide your application ID.',
            attachments: [],
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Message created', schema: { example: { _id: '6512msg...', content: 'Thanks for reaching out...' } } }),
  );
}


