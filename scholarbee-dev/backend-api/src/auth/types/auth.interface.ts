import { Request } from 'express';
import { Socket } from 'socket.io';
import { ResourceProtectionStrategy } from 'src/auth/strategies/resource-protection.strategy';
import { OptionalAuthStrategy } from 'src/auth/strategies/optional-auth.strategy';
import { IAppUserContext } from 'src/users/schemas/user.types';
import { UserNS } from 'src/users/schemas/user.schema';
import { LocalAuthenticationStrategy } from '../strategies/local-authentication.strategy';
import { Types } from 'mongoose';
import { BetterOmit } from 'src/utils/typescript.utils';

/**
 * Represents the base user context for the access token payload
 * This includes the base user info and the computed fields like is_primary_campus_admin and university_id but does not include the campus_id and university_id fields
 * Note: JWT payloads serialize ObjectIds to strings. Keep payload types as strings
 * for ObjectId-like fields to avoid unsafe assumptions after decoding.
 */
type AccessTokenBase = Omit<IAppUserContext, 'campus_id' | 'university_id'> & {
  campus_id?: string;
  university_id?: string;
};

export interface AccessTokenPayload extends AccessTokenBase {
  sub: string;
  userId: string;
}


export interface AccessTokenPayloadWithObjectId extends BetterOmit<AccessTokenPayload, 'campus_id' | 'university_id'> {
  campus_id?: Types.ObjectId;
  university_id?: Types.ObjectId;
}

export interface RefreshTokenPayload {
  userId: string;
  sub: string;
}

export interface LoginRequest extends Request {
  user: Awaited<ReturnType<LocalAuthenticationStrategy['validate']>>;
}

export interface AuthenticatedRequest extends Request {
  user: Awaited<ReturnType<ResourceProtectionStrategy['validate']>>;
}

/**
 * Authenticated request for Campus Admin users
 * Ensures:
 * 1. user_type is Campus_Admin
 * 2. campus_id is present (non-nullable)
 * 3. campus_id is a valid ObjectId
 */
export interface CampusAdminAuthenticatedRequest extends Request {
  user: BetterOmit<Awaited<ReturnType<ResourceProtectionStrategy['validate']>>, 'user_type' | 'campus_id'> & {
    user_type: UserNS.UserType.Campus_Admin;
    campus_id: Types.ObjectId; // Non-nullable, validated to be valid ObjectId
  };
}

export interface OptionalAuthenticatedRequest extends Request {
  user?: Awaited<ReturnType<OptionalAuthStrategy['validate']>> | null;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    // user: AccessTokenPayload;
    user: Awaited<ReturnType<ResourceProtectionStrategy['validate']>>;
  };
}
