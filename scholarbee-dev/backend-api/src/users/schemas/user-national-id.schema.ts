import { Prop, Schema } from '@nestjs/mongoose';
import { UserNS } from './user.namespace';

@Schema({
  timestamps: false,
})
export class NationalIdCard implements UserNS.INationalIdCard {
  @Prop({ required: false })
  front_side?: string;

  @Prop({ required: false })
  back_side?: string;
}
