import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  _id: false,
  timestamps: false,
})
export class BayesianWeightDimension {
  @Prop({ type: Number, required: true })
  alpha: number;

  @Prop({ type: Number, required: true })
  beta: number;
}

@Schema({
  _id: false,
  timestamps: false,
})
export class BayesianWeightsSchema {
  @Prop({ type: BayesianWeightDimension, required: true })
  degree_match: BayesianWeightDimension;

  @Prop({ type: BayesianWeightDimension, required: true })
  field_match: BayesianWeightDimension;

  @Prop({ type: BayesianWeightDimension, required: true })
  city_match: BayesianWeightDimension;

  @Prop({ type: BayesianWeightDimension, required: true })
  fee_match: BayesianWeightDimension;
}
