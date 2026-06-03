import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { DiscoveryMode } from '@/types';

export const schema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .regex(
        /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/,
        'First Name must contain only letters and single spaces between words'
      )
      .transform((val) => val.trim()),
    // last_name: z
    //   .string()
    //   .trim()
    //   .min(1, 'Last Name is required')
    //   .regex(
    //     /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/,
    //     'Last Name must contain only letters and single spaces between words'
    //   )
    //   .transform((val) => val.trim()),
    phone_number: z
      .string()
      .transform((val) => val || '')
      .refine((value) => value.trim() !== '', {
        message: 'Phone number is Required'
      })
      .refine((value) => isValidPhoneNumber(value), {
        message: 'Please enter a valid phone number'
      }),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .max(254, 'Email address is too long')
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address '
      ),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long'),
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{};':"\\|,.<>?~\-\s]{8,}$/,
    //   'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    // ),
    confirmPassword: z
      .string()
      .min(1, 'Confirm Password is required')
      .min(8, 'Confirm Password must be at least 8 characters long'),
    referralSource: z.enum(
      [
        DiscoveryMode.Instagram,
        DiscoveryMode.TikTok,
        DiscoveryMode.Facebook,
        DiscoveryMode.Invitation,
        DiscoveryMode.Others
      ],
      {
        errorMap: () => ({
          message: 'Please select where you heard about ScholarBee'
        })
      }
    ),
    referralCode: z.string().optional()
    // agree: z.boolean().refine((v) => v === true, {
    //   message: 'You must agree to the terms and conditions'
    // })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
  .refine(
    (data) => {
      if (data.referralSource === DiscoveryMode.Invitation) {
        return (
          data.referralCode !== undefined && data.referralCode.trim().length > 0
        );
      }
      return true;
    },
    {
      message: 'Referral code is required for Invitation',
      path: ['referralCode']
    }
  );

export type FormData = z.infer<typeof schema>;
