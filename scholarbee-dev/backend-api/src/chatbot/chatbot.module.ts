import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ChatbotConversationService } from './chatbot-conversation.service';
import {
  ChatbotConversation,
  ChatbotConversationSchema,
} from './schemas/chatbot-conversation.schema';

/**
 * AI assistant (BeeBot) — Gemini tool-calling via Python worker.
 * Kept separate from src/chat/ (human campus/support messaging).
 */
@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: ChatbotConversation.name, schema: ChatbotConversationSchema },
    ]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotConversationService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
