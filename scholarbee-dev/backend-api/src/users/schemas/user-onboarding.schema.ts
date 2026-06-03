import { Prop, Schema } from '@nestjs/mongoose';
import { UserNS } from './user.namespace';

@Schema({
  _id: false,
  timestamps: false,
})
export class OnboardingRangeValue implements UserNS.IOnboardingRangeValue {
  /**
   * Inclusive lower bound for a numeric range.
   * For fee range this represents PKR per semester.
   */
  @Prop({ required: false, min: 0, default: null })
  min?: number | null;

  /**
   * Inclusive upper bound for a numeric range.
   * For fee range this represents PKR per semester.
   */
  @Prop({ required: false, min: 0, default: null })
  max?: number | null;
}

@Schema({
  _id: false,
  timestamps: false,
})
export class OnboardingMarksRange implements UserNS.IOnboardingMarksRange {
  /**
   * Inclusive lower bound of previous marks percentage (0-100).
   */
  @Prop({ required: false, min: 0, max: 100 })
  min_percent?: number | null;

  /**
   * Inclusive upper bound of previous marks percentage (0-100).
   */
  @Prop({ required: false, min: 0, max: 100 })
  max_percent?: number | null;
}

@Schema({
  _id: false,
  timestamps: false,
})
export class OnboardingStartTimeline implements UserNS.IOnboardingStartTimeline {
  /**
   * Canonical onboarding timeline type.
   * Null indicates "just exploring" or no committed timeline.
   */
  @Prop({
    type: String,
    enum: [...Object.values(UserNS.OnboardingStartTimelineType), null],
    required: false,
    default: null,
  })
  type: UserNS.OnboardingStartTimelineType | null;

  /**
   * Timestamp when user selected the current timeline option.
   * Helps resolve relative intent over time.
   */
  @Prop({ type: Date, required: false })
  selected_at?: Date;
}

@Schema({
  _id: false,
  timestamps: false,
})
export class OnboardingPreferences implements UserNS.IOnboardingPreferences {
  /**
   * Canonical degree goal from onboarding.
   * Null means user intentionally skipped/opted out.
   */
  @Prop({
    type: String,
    enum: [...Object.values(UserNS.OnboardingDegreeGoal), null],
    required: false,
  })
  degree_goal?: UserNS.OnboardingDegreeGoal | null;

  /**
   * Preferred city names selected by user during onboarding.
   */
  @Prop({ type: [String], default: [], required: false })
  preferred_cities?: string[];

  @Prop({ type: [String], default: [], required: false })
  preferred_fields_of_study?: string[];

  /**
   * User affordability range per semester in PKR.
   */
  @Prop({ type: OnboardingRangeValue, required: false })
  semester_fee_range?: OnboardingRangeValue;

  /**
   * Previous marks range preference.
   * Null means user intentionally opted out of sharing marks preference.
   */
  @Prop({ type: OnboardingMarksRange, required: false })
  previous_marks_range?: OnboardingMarksRange;

  /**
   * Normalized timeline selection with a capture timestamp.
   */
  @Prop({ type: OnboardingStartTimeline, required: false })
  start_timeline?: OnboardingStartTimeline;

  /**
   * Questionnaire schema version for forward-compatible migrations.
   */
  @Prop({ type: Number, required: false, default: 1 })
  version?: number;

  /**
   * Last update timestamp for onboarding preferences object.
   */
  @Prop({ type: Date, required: false })
  updated_at?: Date;
}
