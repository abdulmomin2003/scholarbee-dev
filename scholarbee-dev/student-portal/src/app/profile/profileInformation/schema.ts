import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full Name must be at least 2 characters')
    .max(50, 'Full Name must not exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Only letters and spaces allowed.'),
  date_of_birth: z.string().min(1, 'Date of Birth is required'),

  gender: z.string().min(1, 'Gender is required'),
  nationality: z.string().optional(),
  father_name: z
    .string()
    .min(2, "Father's Name must be at least 2 characters")
    .max(50, "Father's Name must not exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, 'Only letters and spaces allowed.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email address is too long')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address '),
  phone_number: z
    .string()
    .trim()
    .min(10, 'Phone Number must be at least 10 characters')
    .max(15, 'Phone Number must not exceed 15 characters')
    .regex(
      /^\+?[0-9]+$/,
      'Phone Number must contain only numbers with an optional + prefix'
    ),
  stateOrProvince: z.string().min(1, 'State/Province is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z
    .string()
    .trim()
    .min(1, 'Postal/Zip Code is required')
    .regex(
      /^\d{4,6}$/,
      'Postal/Zip Code must be 4-6 digits only (no letters or special characters)'
    ),
  streetAddress: z
    .string()
    .min(1, 'Street Address is required')
    .max(50, 'Street Address must not exceed 50 characters'),
  provinceOfDomicile: z.string().min(1, 'Province of Domicile is required'),
  districtOfDomicile: z.string().min(1, 'District of Domicile is required'),
  profile_image_url: z.string().optional()
});
