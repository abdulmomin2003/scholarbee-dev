import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  InferSchemaType,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';
import { ConversationParticipantType } from './conversation.schema';
import { WithObjectId } from 'src/utils/db.utils';

@Schema({ timestamps: true })
export class Message {
  _id?: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversation_id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  sender_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: ConversationParticipantType,
    required: true,
  })
  sender_type: ConversationParticipantType;

  @Prop({ type: String, enum: ['User', 'Campus'], required: true })
  sender_type_ref: string;

  // Keep a track of which user replied on behalf of the campus
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  replied_by_user_id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  replied_by_user: any;

  @Prop({ required: true })
  content: string;

  /**
   * Whether this specific message has been read by the student side.
   * Only meaningful when `sender_type === 'campus'` (i.e., the campus sent this message to the student).
   * Updated in bulk when the student calls PATCH /read/user on the conversation.
   */
  @Prop({ default: false })
  is_read_by_user: boolean;

  /**
   * Whether this specific message has been read by the campus admin side.
   * Only meaningful when `sender_type === 'user'` (i.e., the student sent this message to the campus).
   * Updated in bulk when any campus admin calls PATCH /read/campus on the conversation.
   *
   * Source of truth for counting unread student messages (used by the nightly notification cron).
   */
  @Prop({ default: false })
  is_read_by_campus: boolean;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  sender: any;

  @Prop({ type: String, default: null })
  sessionId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export type MessageDocument = WithObjectId<
  InferSchemaType<typeof MessageSchema>
>;
