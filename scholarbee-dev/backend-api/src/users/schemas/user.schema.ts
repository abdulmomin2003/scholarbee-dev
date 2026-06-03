import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InferSchemaType, Types } from 'mongoose';
import { Campus } from 'src/campuses/schemas/campus.schema';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { LivingStatusEnum } from 'src/common/constants/shared.constants';
import { WithObjectId } from 'src/utils/db.utils';
import { HashingUtils } from 'src/utils/hashing.utils';
import { BetterOmit, WithRequired } from 'src/utils/typescript.utils';
import { EducationalBackground } from './user-educational.schema';
import { OnboardingPreferences } from './user-onboarding.schema';
import { NationalIdCard } from './user-national-id.schema';
import { UserNS } from './user.namespace';
import { BayesianWeightsSchema } from './user-bayesian-weights.schema';

// Re-exports: keep a single public entry for `user.schema` while types live in smaller files.
export { UserNS } from './user.namespace';
export {
  OnboardingRangeValue,
  OnboardingMarksRange,
  OnboardingStartTimeline,
  OnboardingPreferences,
} from './user-onboarding.schema';
export { MarksGPA, EducationalBackground } from './user-educational.schema';
export { NationalIdCard } from './user-national-id.schema';
export { BayesianWeightsSchema, BayesianWeightDimension } from './user-bayesian-weights.schema';

@Schema({
  timestamps: true,
  collection: DB_COLLECTIONS.USERS,
})
export class User {
  /**
   * This field is be received on signup and should be required
   */
  @Prop({ required: true })
  full_name: string;

  /**
   * first_name optional on signup but must be received when applying for admission
   */
  @Prop({ required: false })
  first_name?: string;

  /**
   * last_name is optional on signup but must be received when applying for admission
   */
  @Prop({ required: false })
  last_name?: string;

  @Prop()
  date_of_birth?: Date;

  @Prop()
  father_name?: string;

  @Prop()
  father_profession?: string;

  @Prop({
    type: String,
    enum: LivingStatusEnum,
  })
  father_status?: LivingStatusEnum;

  @Prop()
  father_income?: string;

  @Prop()
  mother_name?: string;

  @Prop()
  mother_profession?: string;

  @Prop({
    type: String,
    enum: LivingStatusEnum,
  })
  mother_status?: LivingStatusEnum;

  @Prop()
  mother_income?: string;

  @Prop()
  religion?: string;

  @Prop({ enum: ['yes', 'no'] })
  special_person?: string;

  @Prop({ enum: ['Male', 'Female', 'Other'] })
  gender?: string;

  @Prop()
  nationality?: string;

  /**
   * Email is immutable per user record, but not globally unique.
   * Uniqueness is enforced with `user_type` via a compound unique index
   * so a single email can exist for multiple roles (e.g. Student + Admin).
   */
  @Prop({
    required: true, immutable: true,
    unique: true, // this unique constraint should be removed once each campus type login endpoint is split, otherwise it will cause issues with the login flow

  })
  email: string;

  /**
   * Auth provider for the user. Defaults to 'local'.
   * Used to distinguish local vs social auth users.
   */
  @Prop({ type: String, enum: UserNS.AuthProvider, default: UserNS.AuthProvider.Local })
  authProvider?: UserNS.AuthProvider;

  /**
   * Provider specific user id (e.g. Google sub/id)
   */
  @Prop({ required: false })
  googleId?: string;

  @Prop()
  phone_number?: string;

  /**
   * Nested onboarding preference payload captured from recommendation flow.
   * Keeping this object nested avoids root schema bloat and supports partial updates.
   */
  @Prop({ type: OnboardingPreferences, required: false })
  onboarding_preferences?: OnboardingPreferences;

  @Prop({ type: BayesianWeightsSchema, required: false })
  bayesian_weights?: BayesianWeightsSchema;

  // 0 means only signup is completed
  // 1 means only profile is completed
  // 2 means only academic is completed
  // 3 means only financial is completed
  // 4 means only document is completed
  // 5 means all steps are completed
  @Prop({ default: 0 })
  current_stage?: number;

  @Prop()
  fatherEmailAddress?: string;

  @Prop()
  fatherPhoneNumber?: string;

  @Prop({ type: String, enum: UserNS.ProvinceOfDomicile })
  provinceOfDomicile?: UserNS.ProvinceOfDomicile;

  @Prop()
  districtOfDomicile?: string;

  @Prop()
  stateOrProvince?: string;

  @Prop()
  city?: string;

  @Prop()
  postalCode?: string;

  @Prop()
  streetAddress?: string;

  @Prop()
  address_id?: Types.ObjectId;

  @Prop({ required: true, enum: UserNS.UserType })
  user_type: UserNS.UserType;

  /**
   * Short, memorable student identifier used by marketing and support.
   * Generated sequentially on signup for users with user_type='student'.
   * Format: SB_000000001, SB_000000002, ... (max 9 digits)
   */
  @Prop({ required: false })
  student_id?: string;

  @Prop({
    type: String,
    enum: UserNS.DiscoveryMode,
    required: false,
  })
  discovery_mode?: UserNS.DiscoveryMode;

  @Prop()
  registration_no?: string;

  @Prop({ type: Types.ObjectId, required: false, ref: Campus.name })
  campus_id?: Types.ObjectId;

  @Prop()
  user_profile_id?: string;

  @Prop()
  profile_image_url?: string;

  @Prop({ type: [EducationalBackground], default: [], required: false })
  educational_backgrounds?: EducationalBackground[];

  @Prop({ type: NationalIdCard, required: false })
  national_id_card?: NationalIdCard;

  @Prop({ default: () => new Date() })
  created_at: Date;

  /**
   * Hash of the email verification token
   * Used by AuthService to verify email
   */
  @Prop({ default: '' })
  verifyToken: string;

  // verifyTokenExpiration
  @Prop({ type: Date })
  verifyTokenExpiration?: Date;

  @Prop({ default: false })
  _verified: boolean;

  @Prop({ default: false })
  isProfileCompleted?: boolean;

  @Prop()
  createdBy?: string;

  // Used by Payload CMS
  @Prop({ required: false })
  salt?: string;

  // Used by Payload CMS
  @Prop({ required: false })
  hash?: string;

  // refresh token hash
  @Prop({ required: false, default: null })
  refreshTokenHash?: string;

  // @deprecated No need for now
  // @Prop({ default: 0 })
  // loginAttempts: number;

  // @deprecated No need for now
  // @Prop()
  // lockUntil: Date;

  /**
   * Hash of the reset password token
   * Used by AuthService to reset password
   */
  @Prop()
  resetPasswordToken?: string;

  @Prop({ type: Date })
  resetPasswordExpiration?: Date;

  /**
   * Hash of the reset password token
   * Used by AuthService to reset password
   */
  @Prop({ required: false })
  password?: string;

  // @deprecated No need for now
  // isLocked(): boolean {
  //   return !!(this.lockUntil && this.lockUntil > new Date());
  // }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.hash) {
      return false;
    }

    try {
      // Use HashingUtils for consistent password verification
      return await HashingUtils.verifyPassword(candidatePassword, this.hash);
    } catch (error) {
      console.error('Password comparison error:', error);
      return false;
    }
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Enforce role-scoped email uniqueness.
 * A single email may have multiple user documents as long as each has a different `user_type`.
 */
UserSchema.index({ email: 1, user_type: 1 }, { unique: true });

/**
 * Unique student_id index for student users only.
 * This ensures student IDs are unique among students while allowing
 * other user types to use the same identifier field without conflict.
 */
UserSchema.index(
  { student_id: 1 },
  { unique: true, partialFilterExpression: { user_type: UserNS.UserType.Student } },
);

// Add pre-save hooks for password hashing
UserSchema.pre('save', async function (next) {
  const user = this;
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  try {
    if (!user.password) {
      throw new Error('Password is required');
    }
    // Use HashingUtils for consistent password hashing
    const { hash, salt } = await HashingUtils.hashPassword({
      password: user.password,
    });
    user.hash = hash;
    user.salt = salt;

    // Remove the plain text password
    delete user.password;

    next();
  } catch (error) {
    next(error);
  }
});

// Add method to check password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.hash) {
    return false;
  }

  try {
    // Use HashingUtils for consistent password verification
    return await HashingUtils.verifyPassword(candidatePassword, this.hash);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Add methods to the schema
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Add the comparePassword method to the interface
export type UserDocument = WithObjectId<InferSchemaType<typeof UserSchema>>;

/**
 * Absolutely required fields for creating a new user with local authentication
 */
export type SignupUserDocPayload = BetterOmit<
  User,
  'refreshTokenHash' | 'isProfileCompleted' | 'comparePassword'
>;

/**
 * Absolutely required fields for creating a new user with Google OAuth authentication
 */
export type GoogleOAuthSignupUserDocPayload = WithRequired<SignupUserDocPayload,
  'googleId'
>;
