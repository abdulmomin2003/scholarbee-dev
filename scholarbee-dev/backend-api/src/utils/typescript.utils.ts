import { Types } from 'mongoose';

/**
 * TypeScript utility to omit properties from an interface
 * @usage:
 * ```ts
 * interface User {
 *  id: string;
 *  name: string;
 *  email: string;
 *  password: string;
 * }
 * type PublicUser = BetterOmit<User, 'password'>;
 * // PublicUser === { id: string; name: string; email: string }
 * ```
 */
export type BetterOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};


/**
 * Make certain keys required in an interface
 * @usage:
 * ```ts
 * interface User {
 *  id: string;
 *  name: string;
 *  email: string;
 * }
 * type UserWithName = WithRequired<User, 'name'>;
 * // UserWithName === { id: string; name: string; email: string }
 */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;


/**
 * Replace certain keys in T with ObjectId | P[K]
 */
export type PopulateRefs<
  T,
  // The constraint P extends Partial<Record<keyof T, any>> guarantees the mapping only contains valid keys of T.
  P extends Partial<Record<keyof T, any>>, // ✅ constrain P’s keys to be subset of keyof T
> = BetterOmit<
  T,
  Extract<keyof P, keyof T> // Extract<keyof P, keyof T> ensures we only omit keys that actually exist in T.
> & {
    [K in Extract<keyof P, keyof T>]: Types.ObjectId | P[K];
  };
