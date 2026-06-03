import { SetMetadata } from '@nestjs/common';
import { UserNS } from '../../users/schemas/user.schema';

export const ALLOWED_USER_TYPES_KEY = 'allowedUserTypes';
export const AllowedUserTypes = (...userTypes: [UserNS.UserType, ...UserNS.UserType[]]) =>
    SetMetadata(ALLOWED_USER_TYPES_KEY, userTypes);

