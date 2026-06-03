import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MlShadowComparisonDocument = MlShadowComparison & Document;

@Schema({ timestamps: { createdAt: 'recorded_at', updatedAt: false } })
export class MlShadowComparison {
  @Prop({ type: Types.ObjectId, required: true })
  student_id: Types.ObjectId;

  @Prop({ type: [String], required: true })
  rules_top5: string[];

  @Prop({ type: [String], required: true })
  ml_top5: string[];

  @Prop({ type: Number, required: true })
  rank_correlation: number;

  @Prop({ type: [Number], required: true })
  rules_scores: number[];

  @Prop({ type: [Number], required: true })
  ml_scores: number[];

  @Prop({ type: Date, default: Date.now, index: -1 })
  recorded_at: Date;
}

export const MlShadowComparisonSchema = SchemaFactory.createForClass(MlShadowComparison);
