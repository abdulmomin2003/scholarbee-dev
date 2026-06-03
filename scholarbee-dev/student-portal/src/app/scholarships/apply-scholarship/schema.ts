import { getAllDistricts } from '@/app/create-profile/constants/citiesAndDistricts';
import { z } from 'zod';

export const provinces = [
  { value: 'punjab', label: 'Punjab' },
  { value: 'sindh', label: 'Sindh' },
  { value: 'balochistan', label: 'Balochistan' },
  { value: 'khyber_pakhtunkhwa', label: 'Khyber Pakhtunkhwa' },
  { value: 'gilgit', label: 'Gilgit Baltistan' },
  { value: 'kashmir', label: 'Azad Kashmir' },
  { value: 'islamabad', label: 'Islamabad Capital Territory' }
];

export const scholarshipFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .refine((val) => val.trim() !== '', 'Name cannot be empty spaces'),
    father_name: z
      .string()
      .min(1, 'Father Name is required')
      .refine((val) => val.trim() !== '', 'Father Name cannot be empty spaces'),
    father_status: z.enum(['alive', 'deceased'], {
      errorMap: () => ({ message: "Please select your Father's Status" })
    }),
    domicile: z.enum(
      [...getAllDistricts().map((district) => district.value)] as [
        string,
        ...string[]
      ],
      {
        errorMap: () => ({
          message: 'Please select your District of Domicile'
        })
      }
    ),
    provinceOfDomicile: z.enum(
      [...provinces.map((province) => province.value)] as [string, ...string[]],
      {
        errorMap: () => ({
          message: 'Please select your Province of Domicile'
        })
      }
    ),
    monthly_household_income: z.enum(
      ['0-50k', '50k-100k', '100k-150k', '150k-200k', 'above-200k'],
      {
        errorMap: () => ({
          message: 'Please select your Monthly Household Income'
        })
      }
    ),
    last_degree_type: z.enum(['Intermediate', 'Bachelors'], {
      errorMap: () => ({ message: 'Please select your last degree type' })
    }),
    last_degree_percentage: z
      .string()
      .min(1, 'Last Degree Percentage is required')
      .refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num >= 1 && num <= 100;
        },
        { message: 'Last Degree Percentage must be between 1 and 100' }
      ),
    personal_statement: z
      .string()
      .min(1, 'Please enter your Personal Statement')
      .max(500, 'Personal Statement should not exceed 500 characters')
      .refine(
        (val) => val.trim() !== '',
        'Personal Statement cannot be empty spaces'
      ),
    reference_1: z
      .string()
      .min(1, 'Reference 1 is required')
      .max(200, 'Reference 1 should not exceed 200 characters')
      .refine((val) => val.trim() !== '', 'Reference 1 cannot be empty spaces'),
    reference_2: z
      .string()
      .min(1, 'Reference 2 is required')
      .max(200, 'Reference 2 should not exceed 200 characters')
      .refine((val) => val.trim() !== '', 'Reference 2 cannot be empty spaces')
  })
  .refine(
    (data) => {
      if (!data.domicile) {
        return !!data.provinceOfDomicile;
      }
      return true;
    },
    {
      message:
        'If District of Domicile is not provided, Province of Domicile is required',
      path: ['provinceOfDomicile']
    }
  );

export type ScholarshipFormData = z.infer<typeof scholarshipFormSchema>;

export const APPLY_SCHOLARSHIPS_FORM = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    value: '',
    required: true,
    disabled: true,
    placeholder: 'Enter your full name'
  },
  {
    name: 'father_name',
    label: 'Father Name',
    type: 'text',
    value: '',
    required: true,
    dynamic: true,
    placeholder: "Enter your father's full name"
  },
  {
    name: 'father_status',
    label: "Father's Status",
    type: 'select',
    value: 'alive',
    options: [
      { value: 'alive', label: 'Alive' },
      { value: 'deceased', label: 'Deceased' }
    ],
    required: true,
    dynamic: true,
    placeholder: "Select your father's status"
  },
  {
    name: 'provinceOfDomicile',
    label: 'Province of Domicile',
    type: 'select',
    value: '',
    options: provinces,
    required: true,
    conditional: true,
    placeholder: 'Select your province of domicile'
  },
  {
    name: 'domicile',
    label: 'District of Domicile',
    type: 'select',
    value: '',
    options: [],
    required: true,
    dynamic: true,
    conditional: true,
    placeholder: 'Select your district of domicile'
  },
  {
    name: 'last_degree_percentage',
    label: 'Last Degree Percentage',
    type: 'number',
    value: '',
    required: true,
    placeholder: 'Enter your percentage (1-100)'
  },
  {
    name: 'monthly_household_income',
    label: 'Monthly Household Income',
    type: 'select',
    value: '',
    options: [
      { value: '0-50k', label: '0 to 50k' },
      { value: '50k-100k', label: '50k to 100k' },
      { value: '100k-150k', label: '100k to 150k' },
      { value: '150k-200k', label: '150k to 200k' },
      { value: 'above-200k', label: 'above 200k' }
    ],
    required: true,
    placeholder: 'Select your monthly household income'
  },
  {
    name: 'reference_1',
    label: 'Reference 1',
    type: 'text',
    value: '',
    required: true,
    placeholder: 'Enter your first reference contact'
  },
  {
    name: 'reference_2',
    label: 'Reference 2',
    type: 'text',
    value: '',
    required: true,
    placeholder: 'Enter your second reference contact'
  },
  {
    name: 'personal_statement',
    label: 'Personal Statement',
    type: 'textarea',
    width: 'full',
    value: '',
    required: true,
    placeholder:
      'Write a brief statement about why you deserve this scholarship (max 500 characters)'
  }
];
