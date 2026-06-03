import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';


@Schema({
  timestamps: { createdAt: false, updatedAt: false },
  collection: DB_COLLECTIONS.NOTIFICATION_READ_RECEIPTS,
})
export class NotificationReadReceipt {
  @Prop({ type: Types.ObjectId, ref: 'Notification', required: true })
  notificationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  readAt: Date;
}

export type NotificationReadReceiptDocument = NotificationReadReceipt &
  Document;
export const NotificationReadReceiptSchema = SchemaFactory.createForClass(
  NotificationReadReceipt,
);

// Create a unique index on notificationId and userId to prevent duplicate read receipts for the same notification and user
NotificationReadReceiptSchema.index(
  { notificationId: 1, userId: 1 },
  { unique: true },
);
