import { z } from 'zod';

export const personalInfoSchema = z.object({
  first_name: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(
      z
        .string()
        .min(2, 'First Name must be at least 2 characters')
        .max(50, 'First Name must not exceed 50 characters')
        .regex(/^[A-Za-z\s]+$/, 'Only letters and spaces allowed.')
    ),
  last_name: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(
      z
        .string()
        .min(2, 'Last Name must be at least 2 characters')
        .max(50, 'Last Name must not exceed 50 characters')
        .regex(/^[A-Za-z\s]+$/, 'Only letters and spaces allowed.')
    ),
  date_of_birth: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().min(1, 'Date of Birth is required')),
  gender: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().min(1, 'Gender is required')),
  nationality: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .refine(() => true, { message: '' }), // Make nationality optional
  father_name: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .refine((val) => !val || val.length >= 2, {
      message: "Father's name must be at least 2 characters"
    })
    .pipe(
      z
        .string()
        .max(50, "Father's name must not exceed 50 characters")
        .regex(/^[A-Za-z\s]*$/, 'Only letters and spaces allowed.')
    ),
  father_status: z
    .string()
    .nullish()
    .transform((val) => val || undefined),
  father_profession: z
    .string()
    .nullish()
    .transform((val) => val ?? ''),
  father_income: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true; // Allow empty values
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 1000000000; // 0 to 1 billion PKR
      },
      {
        message: "Father's income must be between 0 and 1,000,000,000"
      }
    ),
  mother_name: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .refine((val) => !val || val.length >= 2, {
      message: "Mother's name must be at least 2 characters"
    })
    .pipe(
      z
        .string()
        .max(50, "Mother's name must not exceed 50 characters")
        .regex(/^[A-Za-z\s]*$/, 'Only letters and spaces allowed.')
    ),
  mother_status: z
    .string()
    .nullish()
    .transform((val) => val || undefined),
  mother_profession: z
    .string()
    .nullish()
    .transform((val) => val ?? ''),
  mother_income: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true; // Allow empty values
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 1000000000; // 0 to 1 billion PKR
      },
      {
        message: "Mother's income must be between 0 and 1,000,000,000"
      }
    ),
  religion: z
    .string()
    .nullish()
    .transform((val) => val ?? ''),
  special_person: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().min(1, 'Special Person is required')),
  profile_image_url: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().optional())
});

export const contactInfoSchema = z.object({
  email: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(
      z
        .string()
        .trim()
        .min(1, 'Email is required')
        .max(254, 'Email address is too long')
        .regex(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please enter a valid email address '
        )
    ),
  phone_number: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(
      z
        .string()
        .trim()
        .min(10, 'Phone Number must be at least 10 characters')
        .max(15, 'Phone Number must not exceed 15 characters')
        .regex(
          /^\+?[0-9]+$/,
          'Phone Number must contain only numbers with an optional + prefix'
        )
    ),
  fatherEmailAddress: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .refine(
      (val) =>
        !val || (val.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)),
      {
        message: 'Please enter a valid email address'
      }
    ),
  fatherPhoneNumber: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .refine(
      (val) =>
        !val ||
        (val.trim().length >= 10 &&
          val.trim().length <= 15 &&
          /^\+?[0-9]+$/.test(val.trim())),
      {
        message:
          'Phone Number must be 10-15 characters and contain only numbers with an optional + prefix'
      }
    ),
  provinceOfDomicile: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('Province of Domicile is required')),
  districtOfDomicile: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('District of Domicile is required')),
  stateOrProvince: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('State or Province is required')),
  city: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('City is required')),
  postalCode: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(
      z
        .string()
        .nonempty('Postal code is required')
        .regex(/^[A-Za-z0-9\- ]{3,10}$/, 'Invalid postal code format')
    ),
  streetAddress: z
    .string()
    .min(1, 'Street Address is required')
    .max(50, 'Street Address must not exceed 50 characters')
});

export const educationalInfoSchema = z.object({
  education_level: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('Education Level is required')),
  school_college_university: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('School/College is required')),
  field_of_study: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('Field of Study is required')),
  marks_gpa: z.object({
    total_marks_gpa: z
      .string()
      .nullish()
      .transform((val) => val ?? '')
      .pipe(z.string().nonempty('Total Marks/GPA is required')),
    obtained_marks_gpa: z
      .string()
      .nullish()
      .transform((val) => val ?? '')
      .pipe(z.string().nonempty('Obtained Marks/GPA is required'))
  }),
  year_of_passing: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('Year of Passing is required')),
  board: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().nonempty('Board is required')),
  transcript: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().min(1, 'Transcript is required'))
});

export const educationalBackgroundSchema = z.object({
  educational_backgrounds: z.array(
    z.object({
      education_level: z
        .string()
        .nullish()
        .transform((val) => val ?? '')
        .pipe(z.string().nonempty('Education Level is required')),
      school_college_university: z
        .string()
        .nullish()
        .transform((val) => val ?? '')
        .pipe(z.string().nonempty('School/College is required')),
      field_of_study: z
        .string()
        .nullish()
        .transform((val) => val ?? '')
        .pipe(z.string().nonempty('Field of Study is required')),
      marks_gpa: z.object({
        total_marks_gpa: z
          .string()
          .nullish()
          .transform((val) => val ?? '')
          .pipe(z.string().nonempty('Total Marks/GPA is required')),
        obtained_marks_gpa: z
          .string()
          .nullish()
          .transform((val) => val ?? '')
          .pipe(z.string().nonempty('Obtained Marks/GPA is required'))
      }),
      year_of_passing: z
        .string()
        .nullish()
        .transform((val) => val ?? '')
        .pipe(z.string().nonempty('Year of Passing is required')),
      board: z
        .string()
        .nullish()
        .transform((val) => val ?? '')
        .pipe(z.string().nonempty('Board is required')),
      transcript: z
        .string()
        .nullish()
        .transform((val) => val ?? '')
        .pipe(z.string().min(1, 'Transcript is required')),
      _id: z
        .string()
        .nullish()
        .transform((val) => val ?? '')
        .optional(),
      id: z
        .string()
        .nullish()
        .transform((val) => val ?? '')
        .optional(),
      isNewRecord: z.boolean().optional()
    })
  )
});

export const nationalIdCardSchema = z.object({
  front_side: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().min(1, 'Front side is required')),
  back_side: z
    .string()
    .nullish()
    .transform((val) => val ?? '')
    .pipe(z.string().min(1, 'Back side is required'))
});
