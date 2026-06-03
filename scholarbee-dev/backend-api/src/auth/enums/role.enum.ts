/**
 * @deprecated Auth JWTs carry `user_type` ({@link UserNS.UserType}), not a `roles` array.
 * Use {@link AllowedUserTypes} with {@link AllowedUserTypesGuard} for endpoint authorization.
 */
export enum Role {
    USER = 'user',
    ADMIN = 'admin',
    UNIVERSITY_ADMIN = 'university_admin',
    CAMPUS_ADMIN = 'campus_admin',
    STUDENT = 'student',
} 