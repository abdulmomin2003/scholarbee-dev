import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FeatureSnapshot {
  @Prop({ required: true })
  degree_match: number;

  @Prop({ required: true })
  field_similarity: number;

  @Prop({ required: true })
  city_match: number;

  @Prop({ required: true })
  fee_match: number;

  @Prop({ required: true })
  is_partner: boolean;

  @Prop({ required: true })
  has_active_deadline: boolean;

  @Prop({ required: true })
  program_popularity: number;

  @Prop({ required: true })
  student_city_weight: number;

  @Prop({ required: true })
  student_field_weight: number;

  @Prop({ required: true })
  student_degree_weight: number;

  @Prop({ required: true })
  student_fee_weight: number;

  @Prop({ required: true })
  prior_clicks_on_field: number;

  @Prop({ required: true })
  prior_clicks_on_city: number;

  @Prop({ required: true })
  position_in_list: number;
}

@Schema({ timestamps: true })
export class Impression {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AdmissionProgram', required: true })
  program_id: Types.ObjectId;

  @Prop({ required: true })
  session_id: string;

  @Prop({ required: true })
  position: number;

  @Prop({ required: true, enum: ['rules', 'ml'] })
  scoring_engine: string;

  @Prop({ type: Number, default: null })
  label: number | null;

  @Prop({ default: false })
  was_clicked: boolean;

  @Prop({ default: false })
  was_favorited: boolean;

  @Prop({ default: false })
  was_applied: boolean;

  @Prop({ default: false })
  was_ignored: boolean;

  @Prop({ required: true })
  shown_at: Date;

  @Prop({ type: Date, default: null })
  acted_at: Date | null;

  @Prop({ type: Date, default: null })
  session_closed_at: Date | null;

  @Prop({ type: FeatureSnapshot, required: true })
  features: FeatureSnapshot;
}

export type ImpressionDocument = Impression & Document;
export const ImpressionSchema = SchemaFactory.createForClass(Impression);

ImpressionSchema.index({ student_id: 1, shown_at: -1 });
ImpressionSchema.index({ session_id: 1 });
ImpressionSchema.index({ label: 1, shown_at: -1 });
ImpressionSchema.index({ scoring_engine: 1, shown_at: -1 });
