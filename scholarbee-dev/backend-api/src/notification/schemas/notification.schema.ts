import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';

// export enum NotificationType {
//   APPLICATION_REJECTED = 'application/rejected',
//   DEADLINE_PASSED = 'deadline/passed',
//   APPLICATION_ACCEPTED = 'application/accepted',
//   APPLICATION_SUBMITTED = 'application/submitted',
// }

// Embedded subdocument for each recipient (no _id field)
// @Schema({ _id: false })
// export class Recipient {
//   @Prop({ type: String, required: true, refPath: 'audience.audienceType' })
//   id: string; // The id of the user, campus, university, etc.
//
//   @Prop({ type: Boolean, default: false })
//   isRead: boolean; // Read status for this recipient
// }
//
// export const RecipientSchema = SchemaFactory.createForClass(Recipient);

export enum AudienceType {
  User = 'User', // User.name
  University = 'University', // University.name
  Campus = 'Campus', // Campus.name
}

// Notification categories for frontend routing
export enum NotificationCategory {
  // Application related
  APPLICATION = 'application',
  APPLICATION_STATUS = 'application_status',

  // Admission related
  ADMISSION_PROGRAM = 'admission_program',

  // Program related
  PROGRAM = 'program',

  // Institution related
  CAMPUS = 'campus',

  // Financial related
  SCHOLARSHIP = 'scholarship',

  // Communication related
  CHAT = 'chat',

  // Content related
  BLOG_POST = 'blog_post',

  // General
  SYSTEM = 'system',
  GENERAL = 'general',
}

// Simplified navigation types - entity-specific
export enum NavigationTypeEnum {
  // Entity-specific navigation (client decides detail vs list based on entityId presence)
  ADMISSION_PROGRAM = 'admission_program',
  PROGRAM = 'program',
  CAMPUS = 'campus',
  SCHOLARSHIP = 'scholarship',
  APPLICATION = 'application',
  BLOG_POST = 'blog_post',

  // User-specific pages
  USER_PROFILE = 'user_profile',
  USER_DASHBOARD = 'user_dashboard',

  // Application flow pages
  APPLICATION_STATUS = 'application_status',

  // Communication pages
  CHAT_CONVERSATION = 'chat_conversation',

  // No navigation needed
  NONE = 'none',
}

/* 

route_template : '/{0}/{1}/{2}
value_array: ['users',5463738298982387,'status']

[
  {
    resource: 'users',
    value: '5463738298982387',
  },
  {
      resource: 'applications',
      value: '5463738298982387',
  },
]

 */

// Type definitions for better type safety
export interface INavigationContext {
  type: NavigationTypeEnum;
  entityId?: Types.ObjectId;
  params?: Record<string, any>;
}
@Schema({ _id: false })
class NavigationContext {
  @Prop({
    type: String,
    required: true,
    enum: Object.values(NavigationTypeEnum),
  })
  type: NavigationTypeEnum;

  // Optional entity ID for entity-specific navigation
  @Prop({
    type: Types.ObjectId,
    required: false,
  })
  entityId?: Types.ObjectId;

  // Optional additional parameters for complex navigation
  @Prop({ type: Object })
  params?: Record<string, any>;
}

const NavigationContextSchema = SchemaFactory.createForClass(NavigationContext);

@Schema({ _id: false })
class Audience {
  @Prop({
    type: String,
    required: true,
    enum: [AudienceType.User, AudienceType.University, AudienceType.Campus],
  })
  audienceType: AudienceType;

  // ! For Global notifications, recipients is not present
  @Prop({ type: Boolean, required: true })
  isGlobal: boolean;

  @Prop({
    type: [{ type: Types.ObjectId, refPath: 'audienceType' }],
    required: function (this: Audience) {
      return !this.isGlobal;
    },
    // minlength: 1,
  })
  recipients?: Types.ObjectId[];
}

const AudienceSchema = SchemaFactory.createForClass(Audience);

@Schema({
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  collection: DB_COLLECTIONS.NOTIFICATIONS,
})
export class Notification {
  // @Prop({ type: String, required: true, enum: NotificationType })
  // type: NotificationType;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: AudienceSchema, required: true })
  audience: Audience;

  // Core navigation fields (required for frontend routing)
  @Prop({
    type: String,
    required: true,
    enum: Object.values(NotificationCategory),
    default: NotificationCategory.GENERAL,
  })
  category: NotificationCategory;

  @Prop({ type: [NavigationContextSchema], required: false, default: [] })
  navigation?: NavigationContext[];

  // Optional enhancement fields (for advanced use cases)
  @Prop({
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    required: false, // Made optional
  })
  priority?: string;

  @Prop({ type: String, required: false })
  image_url?: string;
}

const NotificationSchema = SchemaFactory.createForClass(Notification);

type NotificationDocument = Notification & Document;

export { NotificationSchema, type NotificationDocument };
