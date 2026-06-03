import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSubscribeMutation } from '@/redux/api/contactApi';
import { toast } from 'react-toastify';

const campusSchema = z.object({
  id: z.string(),
  name: z.string()
});

const formSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .max(254, 'Email address is too long')
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address '
      ),
    name: z
      .string()
      .trim()
      .min(1, 'First Name is required')
      .regex(
        /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/,
        'First Name must contain only letters and single spaces between words'
      ),
    phone: z
      .string()
      .trim()
      .min(10, 'Phone Number must be at least 10 characters')
      .max(15, 'Phone Number must not exceed 15 characters')
      .regex(
        /^\+?[0-9]+$/,
        'Phone Number must contain only numbers with an optional + prefix'
      )
      .transform((val) => val.replace(/\s+/g, '')),
    user_type: z.enum(['Student', 'Admin'], {
      errorMap: () => ({ message: 'Please select a user type' })
    }),
    study_level: z
      .enum(['Bachelors', 'Masters', 'Phd'], {
        errorMap: () => ({ message: 'Please select your level of study' })
      })
      .optional(),
    study_city: z.string().optional(),
    is_looking_for_scholarship: z.boolean().optional(),
    thoughts: z.string().optional(),
    campusesIds: z
      .array(campusSchema)
      .min(1, 'Please select at least one campus')
      .max(3, 'You can select up to 3 campuses')
  })
  .superRefine((data, ctx) => {
    if (data.user_type === 'Student') {
      if (!data.study_level) {
        ctx.addIssue({
          path: ['study_level'],
          code: z.ZodIssueCode.custom,
          message: 'Study level is required for students'
        });
      }
      if (!data.study_city) {
        ctx.addIssue({
          path: ['study_city'],
          code: z.ZodIssueCode.custom,
          message: 'Please select a city to study'
        });
      }
      if (!data.campusesIds || data.campusesIds.length === 0) {
        ctx.addIssue({
          path: ['campusesIds'],
          code: z.ZodIssueCode.custom,
          message: 'Please select at least one campus'
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

const useSubscribeForm = () => {
  const [openToast, setOpenToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<'success' | 'error'>(
    'success'
  );

  const [subscribe, { isLoading }] = useSubscribeMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_looking_for_scholarship: false,
      study_level: undefined,
      user_type: 'Student',
      phone: '',
      thoughts: '',
      campusesIds: []
    }
  });

  const userType = watch('user_type');
  const selectedCampuses = watch('campusesIds');

  const handlePhoneChange = (value: string | undefined) => {
    setValue('phone', value || '', { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        type: 'registration',
        email: data.email,
        name: data.name,
        phone: data.phone,
        user_type: data.user_type,
        ...(data.user_type === 'Student' && {
          is_scholarship: data.is_looking_for_scholarship,
          study_level: data.study_level,
          campusesIds: data.campusesIds.map((campus) => campus.id),
          study_city: data.study_city
        }),
        message: data.thoughts || ''
      };
      console.log('request payload', payload);

      const response = await subscribe(payload).unwrap();

      setToastMessage(response.message || 'Subscribed successfully!');
      setSeverity('success');
      setOpenToast(true);
      reset();
    } catch (error) {
      const errorMessage =
        (error as { data?: { errors?: { message?: string }[] } })?.data
          ?.errors?.[0]?.message ||
        (error as { data?: { message?: string } })?.data?.message ||
        'Something went wrong. Please try again.';
      setToastMessage(errorMessage);
      setSeverity('error');
      setOpenToast(true);
    }
  };

  const handleCloseToast = () => {
    setOpenToast(false);
  };

  const handleChange = (name: string, value: string) => {
    if (!value) return;

    const currentCampuses = selectedCampuses || [];
    if (currentCampuses.length >= 3) {
      toast.error('You can select up to 3 campuses');
      return;
    }

    const campusExists = currentCampuses.find((campus) => campus.id === value);
    if (campusExists) {
      toast.error('Campus already selected');
      return;
    }

    setValue('campusesIds', [...currentCampuses, { name, id: value }], {
      shouldValidate: true
    });
  };

  const handleDelete = (id: string) => {
    const currentCampuses = selectedCampuses || [];
    setValue(
      'campusesIds',
      currentCampuses.filter((campus) => campus.id !== id),
      { shouldValidate: true }
    );
  };

  return {
    register,
    handleSubmit,
    control,
    errors,
    userType,
    handlePhoneChange,
    onSubmit,
    openToast,
    toastMessage,
    severity,
    handleCloseToast,
    isLoading,
    selectedCampuses,
    handleChange,
    handleDelete
  };
};

export default useSubscribeForm;
