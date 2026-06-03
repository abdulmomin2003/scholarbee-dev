import { User } from '../constants/types';

export const sanitizeUser = (
  user: Partial<User>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dirtyFields?: Record<string, any>
): Partial<User> => {
  const allowedFields = [
    'first_name',
    'last_name',
    'date_of_birth',
    'gender',
    'nationality',
    'father_name',
    'father_status',
    'father_profession',
    'father_income',
    'mother_name',
    'mother_status',
    'mother_profession',
    'mother_income',
    'religion',
    'special_person',
    'current_stage'
  ];

  return Object.fromEntries(
    Object.entries(user).filter(
      ([key, value]) =>
        allowedFields.includes(key) &&
        (value !== '' || (dirtyFields && dirtyFields[key])) &&
        key !== 'profile_image_url' // Exclude profile_image_url from being sent
    )
  ) as Partial<User>;
};
