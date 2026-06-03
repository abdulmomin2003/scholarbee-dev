import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';

/**
 * AI chatbot conversation state (BeeBot).
 * Separate from human campus/support chat in src/chat/.
 */
@Schema({
  collection: DB_COLLECTIONS.CHATBOT_CONVERSATIONS,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class ChatbotConversation {
  @Prop({ required: true, index: true })
  session_id: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  user_id: Types.ObjectId;

  /** Serialized Gemini Content[] from the Python worker */
  @Prop({ type: [Object], default: [] })
  history: Record<string, unknown>[];

  @Prop()
  created_at?: Date;

  @Prop()
  updated_at?: Date;
}

export type ChatbotConversationDocument = HydratedDocument<ChatbotConversation>;
export const ChatbotConversationSchema =
  SchemaFactory.createForClass(ChatbotConversation);

ChatbotConversationSchema.index(
  { session_id: 1, user_id: 1 },
  { unique: true },
);
