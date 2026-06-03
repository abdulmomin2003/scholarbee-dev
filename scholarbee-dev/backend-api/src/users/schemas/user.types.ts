import { Types } from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';
import {
  BetterOmit,
} from 'src/utils/typescript.utils';

/**
 * * UserDocument => SanitizedUser (Sensitive fields removed)
 * Sanitized user is a user that has been sanitized of the sensitive fields like password, hash, salt, etc.
 * It does not contain the password, hash, salt, etc.
 * It only contains the fields that are needed for the application
 */
export type SanitizedUser = BetterOmit<
  UserDocument,
  'hash' | 'salt' | 'password' | '_id'
> & {
  _id: string;
};

// TODO: If for a campus admin, campus_id, university_id and the is_primary_campus_admin field must be present
/**
 * * UserDocument => SanitizedUser (Sensitive fields removed) => AppUserContext (Fields needed for the application)
 * Represents the user context for the application as well as data related to permissions and roles 
 * (base user info + data for authentication and authorization)
 */
export type IAppUserContext = Pick<
  SanitizedUser,
  | 'full_name'
  | 'first_name'
  | 'last_name'
  | 'email'
  | '_id'
  | 'user_type'
  | 'campus_id'
  | 'profile_image_url'
  | 'special_person'
  | 'current_stage'
  | 'nationality'
  | 'user_profile_id'
  | 'phone_number'
  | 'created_at'
  | '_verified'
> & {
  // computed fields
  is_primary_campus_admin?: boolean;
  university_id?: Types.ObjectId;
};
