import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthReq } from 'src/auth/decorators/auth-req.decorator';
import { ResourceProtectionGuard } from 'src/auth/guards/resource-protection.guard';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { UserNS } from 'src/users/schemas/user.schema';
import { ChatbotService, ChatbotResponse } from './chatbot.service';
import { ChatbotQueryDto } from './dto/chatbot-query.dto';
import { ChatbotConversationService } from './chatbot-conversation.service';

@ApiTags('Chatbot')
@Controller('chatbot')
@UseGuards(ResourceProtectionGuard)
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly conversationService: ChatbotConversationService,
  ) {}

  @Get('greeting')
  @ApiOperation({ summary: 'Personalized greeting for the authenticated student' })
  getGreeting(@AuthReq() authReq: AuthenticatedRequest): {
    firstName: string;
    greeting: string;
    intro: string;
  } {
    const firstName = this.resolveFirstName(authReq);
    return {
      firstName,
      greeting: `Hi ${firstName} 👋`,
      intro:
        "I'm your AI assistant for ScholarBee. I can help you with applications, guidance, platform questions, and anything related to your student journey.",
    };
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send user query and get AI-powered response' })
  @ApiResponse({ status: 200, description: 'Successfully processed the query' })
  async processQuery(
    @Body() body: ChatbotQueryDto,
    @AuthReq(UserNS.UserType.Student) authReq: AuthenticatedRequest,
  ): Promise<ChatbotResponse> {
    if (!body.query?.trim()) {
      return {
        answer: 'Please provide a valid question.',
        sources: [],
        message: 'Empty query',
      };
    }

    const userId = new Types.ObjectId(
      authReq.user._id ?? authReq.user.userId ?? authReq.user.sub,
    );
    const sessionId =
      body.sessionId?.trim() ||
      `bee-${userId.toString()}-${Date.now().toString(36)}`;

    this.conversationService.assertSessionOwnership(sessionId, userId);

    return this.chatbotService.processQuery(
      body.query.trim(),
      sessionId,
      userId,
      this.resolveFirstName(authReq),
    );
  }

  @Delete('session/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear chatbot conversation for a session' })
  async clearSession(
    @Param('sessionId') sessionId: string,
    @AuthReq(UserNS.UserType.Student) authReq: AuthenticatedRequest,
  ): Promise<void> {
    const userId = new Types.ObjectId(
      authReq.user._id ?? authReq.user.userId ?? authReq.user.sub,
    );
    this.conversationService.assertSessionOwnership(sessionId, userId);
    await this.chatbotService.clearSession(sessionId, userId);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check chatbot worker health (authenticated)' })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.chatbotService.healthCheck();
  }

  /** Prefer first_name; fall back to first token of full_name */
  private resolveFirstName(authReq: AuthenticatedRequest): string {
    const user = authReq.user;
    const direct = user.first_name?.trim();
    if (direct) {
      return direct;
    }
    const fromFull = user.full_name?.trim().split(/\s+/)[0];
    return fromFull || 'there';
  }
}
