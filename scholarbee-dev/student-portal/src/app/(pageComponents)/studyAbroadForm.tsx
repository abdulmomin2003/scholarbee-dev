'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputAdornment
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSubscribeMutation } from '@/redux/api/contactApi';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email address is too long')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
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
  interest: z.enum(['Study Abroad', 'Scholarship', 'Short Courses'], {
    errorMap: () => ({ message: 'Please select an option' })
  })
});

type FormData = z.infer<typeof formSchema>;

const INTEREST_OPTIONS = [
  'Study Abroad',
  'Scholarship',
  'Short Courses'
] as const;

const StudyAbroadForm = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [subscribe, { isLoading }] = useSubscribeMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      phone: '',
      interest: 'Study Abroad'
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await subscribe({
        type: 'study_abroad',
        email: data.email,
        name: data.email.split('@')[0] || 'Student', // Use email prefix as name fallback
        phone: data.phone,
        user_type: 'Student',
        message: `Interested in: ${data.interest}`
      }).unwrap();

      toast.success(
        'Form submitted successfully! Our team will contact you shortly.'
      );
      reset();
    } catch (error) {
      console.log('error', error);
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.data?.errors?.[0]?.message ||
        'Failed to submit form. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <AnimatePresence>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        sx={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: { xs: 0, md: 4, lg: 5 },
          pb: { xs: 4, md: 5 },
          px: { xs: 2, md: 3 },
          background: '#FFFFFF'
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 2, md: 1 }
          }}
        >
          {/* Title */}
          <Typography
            component="h2"
            variant="h4"
            fontWeight={600}
            sx={{
              color: '#000000',
              textAlign: 'center'
            }}
          >
            Get Started With Your Abroad Journey
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: { xs: 1, md: 2 }
            }}
          >
            Fill in your details and our team will contact you shortly.
          </Typography>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', md: '1156px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: { xs: 2, md: 2.5 }
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 2.5 },
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'center'
              }}
            >
              {/* Email Field */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Enter Email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      width: { xs: '100%', md: '372px' },
                      height: '56px',
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        background: '#F9F9F9',
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: '#C8CACD'
                        },
                        '&:hover fieldset': {
                          borderColor: '#C8CACD'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#004AE0'
                        }
                      },
                      '& .MuiInputBase-input': {
                        paddingLeft: '52px',
                        color: '#000000',
                        fontSize: '16px',
                        lineHeight: '20px',
                        '&::placeholder': {
                          color: '#7F848B',
                          opacity: 1
                        }
                      },
                      '& .MuiFormHelperText-root': {
                        color: '#d32f2f'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon
                            sx={{
                              position: 'absolute',
                              left: '16px',
                              color: '#575C62',
                              fontSize: '24px'
                            }}
                          />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* Phone Field */}
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Enter Number"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={{
                      width: { xs: '100%', md: '372px' },
                      height: '56px',
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        background: '#F9F9F9',
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: '#C8CACD'
                        },
                        '&:hover fieldset': {
                          borderColor: '#C8CACD'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#004AE0'
                        }
                      },
                      '& .MuiInputBase-input': {
                        paddingLeft: '52px',
                        color: '#000000',
                        fontSize: '16px',
                        lineHeight: '20px',
                        '&::placeholder': {
                          color: '#7F848B',
                          opacity: 1
                        }
                      },
                      '& .MuiFormHelperText-root': {
                        color: '#d32f2f'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon
                            sx={{
                              position: 'absolute',
                              left: '16px',
                              color: '#575C62',
                              fontSize: '24px'
                            }}
                          />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* Dropdown Field */}
              <FormControl
                sx={{
                  width: { xs: '100%', md: '372px' },
                  height: '56px',
                  position: 'relative'
                }}
              >
                <Controller
                  name="interest"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Select
                        {...field}
                        open={isDropdownOpen}
                        onOpen={() => setIsDropdownOpen(true)}
                        onClose={() => setIsDropdownOpen(false)}
                        error={!!errors.interest}
                        displayEmpty
                        renderValue={(value) => {
                          if (!value) return 'Interested in';
                          return value;
                        }}
                        IconComponent={() => (
                          <ArrowDropDownIcon
                            sx={{
                              position: 'absolute',
                              right: '20px',
                              top: '50%',
                              transform: isDropdownOpen
                                ? 'translateY(-50%) rotate(180deg)'
                                : 'translateY(-50%)',
                              color: '#7F848B',
                              fontSize: '16px',
                              pointerEvents: 'none',
                              transition: 'transform 0.2s'
                            }}
                          />
                        )}
                        sx={{
                          height: '56px',
                          background: '#F9F9F9',
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#C8CACD'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#C8CACD'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#004AE0'
                          },
                          '& .MuiSelect-select': {
                            paddingLeft: '16px',
                            paddingRight: '40px',
                            color: field.value ? '#000000' : '#7F848B',
                            fontSize: '16px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              mt: 1,
                              borderRadius: '8px',
                              boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.12)',
                              border: '1px solid #F2F2F3',
                              '& .MuiMenuItem-root': {
                                height: '40px',
                                padding: '10px 16px',
                                fontSize: '14px',
                                lineHeight: '20px',
                                '&:hover': {
                                  backgroundColor: '#F5F5F5'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: '#004AE0',
                                  color: '#FFFFFF',
                                  '&:hover': {
                                    backgroundColor: '#0038B8'
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        {INTEREST_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.interest && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#d32f2f',
                            marginLeft: '16px',
                            marginTop: '3px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {errors.interest.message}
                        </Typography>
                      )}
                    </>
                  )}
                />
              </FormControl>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              sx={{
                width: { xs: '100%', md: '332px' },
                height: '56px',
                background: '#004AE0',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontWeight: 500,
                fontSize: '18px',
                lineHeight: '20px',
                textTransform: 'none',
                mt: { xs: 2, md: 3 },
                '&:hover': {
                  background: '#0038B8'
                },
                '&:disabled': {
                  background: '#004AE0',
                  opacity: 0.3
                }
              }}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </Box>
        </Box>
      </Box>
    </AnimatePresence>
  );
};

export default StudyAbroadForm;
