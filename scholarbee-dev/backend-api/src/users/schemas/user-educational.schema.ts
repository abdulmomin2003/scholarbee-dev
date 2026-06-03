import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';
import { UserNS } from './user.namespace';

@Schema({
  timestamps: false,
  _id: false,
})
export class MarksGPA implements UserNS.IMarksGPA {
  @Prop({ required: true })
  total_marks_gpa: string;

  @Prop({ required: true })
  obtained_marks_gpa: string;
}

@Schema({
  _id: true,
  timestamps: false,
})
export class EducationalBackground implements UserNS.IEducationalBackground {
  @Prop({ required: true, type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: String, enum: DegreeLevelEnum, required: true })
  education_level: DegreeLevelEnum;

  @Prop({ required: false })
  school_college_university?: string;

  @Prop({ type: MarksGPA, required: true })
  marks_gpa: MarksGPA;

  @Prop({ required: false })
  field_of_study?: string;

  @Prop({ required: false })
  year_of_passing?: string;

  @Prop({
    required: function (this: EducationalBackground) {
      return (
        this.education_level === DegreeLevelEnum.Matriculation ||
        this.education_level === DegreeLevelEnum.IntermediateFScFA
      );
    },
  })
  board?: string;

  @Prop({ required: false })
  transcript?: string;
}
