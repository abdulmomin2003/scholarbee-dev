import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DocumentWithDeleted, SoftDeletePlugin } from 'src/common/plugins/soft-delete.plugin';
import { WithObjectId } from 'src/utils/db.utils';

export type ConversationDocument = DocumentWithDeleted<WithObjectId<Conversation>>

export enum ConversationParticipantType {
  USER = 'user',
  CAMPUS = 'campus',
}

@Schema({
  timestamps: true,
  // Ensure virtuals are included if you use them for populating soft relations
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Conversation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Campus', required: true })
  campus_id: Types.ObjectId;

  @Prop({ default: Date.now })
  last_message_time: Date;

  /**
   * Conversation-level read status for the student side.
   * Set to `true` when the student calls PATCH /read/user (marks all campus messages as read).
   * Set to `false` when the campus sends a new message (new content the student hasn't read).
   *
   * Use this for: UI unread badges, filtering conversations by read status.
   * Do NOT use this for: counting individual unread messages — query the messages collection for that.
   */
  @Prop({ default: false })
  is_read_by_user: boolean;

  /**
   * Conversation-level read status for the campus admin side.
   * Set to `true` when any campus admin calls PATCH /read/campus (marks all student messages as read).
   * Set to `false` when the student sends a new message (new content the campus hasn't read).
   *
   * Use this for: UI unread badges, filtering conversations by read status.
   * Do NOT use this for: counting individual unread messages — query the messages collection for that.
   */
  @Prop({ default: false })
  is_read_by_campus: boolean;

  @Prop()
  last_message: string;

  @Prop({
    type: String,
    enum: ConversationParticipantType,
    default: ConversationParticipantType.USER,
  })
  last_message_sender: ConversationParticipantType;

  @Prop({ type: Number, default: 0 })
  avgResponseTime: number;

  @Prop({ type: Number, default: 0 })
  sessionsCount: number;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

/**
 * # KNOWN LIMITATIONS & CAVEATS
 * * 1. UNIQUE CONSTRAINTS: 
 * The index below ensures a User and Campus only have one conversation. 
 * WARNING: If a conversation is soft-deleted, MongoDB still considers the 'user_id' + 'campus_id' 
 * taken. You cannot create a NEW conversation between them unless you physically delete the 
 * old one or include `_deleted` in the unique index.
 * * 2. LOOKUPS / JOINS:
 * The Aggregation middleware ONLY filters the collection it is applied to. 
 * If another collection (e.g., 'Messages') performs a $lookup into 'Conversations', 
 * the deleted conversations WILL appear unless you manually add a match stage 
 * inside the $lookup pipeline.
 * * 3. POPULATE:
 * Mongoose `populate()` uses `find()`, so it IS covered by this plugin. 
 * If a conversation is deleted, populating it from a Message will return `null`.
 */
ConversationSchema.index({ user_id: 1, campus_id: 1 }, { unique: true });

// Apply the plugin
ConversationSchema.plugin(SoftDeletePlugin);