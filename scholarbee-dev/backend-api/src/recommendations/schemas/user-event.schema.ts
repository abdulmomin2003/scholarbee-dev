import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InferSchemaType, Types, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { UserRecommendationEventType, RecommendationResourceType } from '../types/recommendation.types';
import { WithObjectId } from 'src/utils/db.utils';

@Schema({
  collection: DB_COLLECTIONS.USER_EVENTS,
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class UserEvent {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: false,
    index: true,
  })
  user_id?: Types.ObjectId;

  @Prop({
    type: String,
    required: false,
    index: true,
  })
  session_id?: string;

  @Prop({
    type: String,
    enum: Object.values(UserRecommendationEventType),
    required: true,
    index: true,
  })
  event_type: UserRecommendationEventType;

  @Prop({
    type: String,
    enum: Object.values(RecommendationResourceType),
    required: true,
    index: true,
  })
  resource_type: RecommendationResourceType;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  resource_id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Map,
    of: MongooseSchema.Types.Mixed,
    required: false,
  })
  metadata?: Map<string, any>;

  @Prop({ type: String, required: false })
  field?: string;

  @Prop({ type: String, required: false })
  city?: string;

  @Prop({ type: String, required: false })
  degree_level?: string;

  @Prop({ type: Number, required: false })
  fee_bucket?: number;

  @Prop()
  created_at?: Date;
}

export const UserEventSchema = SchemaFactory.createForClass(UserEvent);

export type UserEventDocument = WithObjectId<
  InferSchemaType<typeof UserEventSchema>
>;
