import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ChatbotConversation,
  ChatbotConversationDocument,
} from './schemas/chatbot-conversation.schema';

@Injectable()
export class ChatbotConversationService {
  constructor(
    @InjectModel(ChatbotConversation.name)
    private readonly conversationModel: Model<ChatbotConversationDocument>,
  ) {}

  async getHistory(
    sessionId: string,
    userId: Types.ObjectId,
  ): Promise<Record<string, unknown>[]> {
    const doc = await this.conversationModel
      .findOne({ session_id: sessionId, user_id: userId })
      .lean();
    return (doc?.history as Record<string, unknown>[]) ?? [];
  }

  async saveHistory(
    sessionId: string,
    userId: Types.ObjectId,
    history: Record<string, unknown>[],
  ): Promise<void> {
    await this.conversationModel.updateOne(
      { session_id: sessionId, user_id: userId },
      {
        $set: { history },
        $setOnInsert: { session_id: sessionId, user_id: userId },
      },
      { upsert: true },
    );
  }

  async clearSession(sessionId: string, userId: Types.ObjectId): Promise<void> {
    await this.conversationModel.deleteOne({
      session_id: sessionId,
      user_id: userId,
    });
  }

  assertSessionOwnership(
    sessionId: string,
    userId: Types.ObjectId,
  ): void {
    if (!sessionId?.trim()) {
      throw new ForbiddenException('Invalid chatbot session');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new ForbiddenException('Invalid user context');
    }
  }
}
