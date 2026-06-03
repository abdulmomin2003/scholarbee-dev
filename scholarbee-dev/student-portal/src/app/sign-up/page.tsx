'use client';
import React, { Suspense } from 'react';
import {
  Box,
  Button,
  Typography,
  // Checkbox,
  Link,
  CircularProgress,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import Image from 'next/image';
import { styles } from './styles';
import { useSignUpForm } from './useSignUp';
import { Controller } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { API_BASE_URL_DEV } from '@/config/config';
import { DiscoveryMode } from '@/types';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthInput from '@/components/molecules/AuthInput';
import AuthPasswordInput from '@/components/molecules/AuthPasswordInput';

// Icons
import userIcon from '@public/assets/svg/user-outlined.svg';
import mailIcon from '@public/assets/svg/mail-outlined.svg';
import googleIcon from '@public/assets/svg/google_ic.svg';

const SignUpFormContent: React.FC = () => {
  const searchParams = useSearchParams();
  const {
    control,
    handleSubmit,
    onSubmit,
    errors,
    loading,
    handleKeyPress,
    watch
  } = useSignUpForm(searchParams);

  const referralSource = watch('referralSource');

  const handleGoogleLogin = () => {
    const redirectUrl = searchParams.get('redirect');
    const googleAuthUrl = `${API_BASE_URL_DEV}/auth/google${
      redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''
    }`;
    window.location.href = googleAuthUrl;
  };

  return (
    <AuthLayout
      staticText="One Platform for"
      animatedWords={['Admissions', 'Scholarships', 'Your Next Move']}
    >
      <Box sx={styles.formContainer}>
        {/* Header */}
        <Box sx={styles.headerBox}>
          <Typography sx={styles.title}>Create new account</Typography>
          <Typography sx={styles.subtitle}>
            Join ScholarBee to discover your academic potential
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }}
          sx={styles.form}
        >
          {/* First Name */}
          <AuthInput
            name="full_name"
            control={control}
            placeholder="Full Name"
            errors={errors}
            startIcon={userIcon}
          />

          {/* Last Name */}
          {/* <AuthInput
            name="last_name"
            control={control}
            placeholder="Last Name"
            errors={errors}
            startIcon={userIcon}
          /> */}

          {/* Phone Number */}
          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <Box sx={styles.phoneInputContainer}>
                <PhoneInput
                  {...field}
                  international
                  defaultCountry="PK"
                  placeholder="Enter phone number"
                  className={`phone-input-field ${errors.phone_number ? 'error' : ''}`}
                />
                {errors.phone_number && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 0.5, ml: 2 }}
                  >
                    {errors.phone_number.message}
                  </Typography>
                )}
              </Box>
            )}
          />

          {/* Email */}
          <AuthInput
            name="email"
            control={control}
            placeholder="Email"
            type="email"
            errors={errors}
            startIcon={mailIcon}
          />

          {/* Password */}
          <AuthPasswordInput
            name="password"
            control={control}
            placeholder="Password"
            errors={errors}
            onKeyPress={handleKeyPress}
          />

          {/* Confirm Password */}
          <AuthPasswordInput
            name="confirmPassword"
            control={control}
            placeholder="Confirm Password"
            errors={errors}
            onKeyPress={handleKeyPress}
          />

          {/* Discovery Source Section */}
          <Box sx={styles.referralContainer}>
            <Typography sx={styles.referralTitle}>
              Where did you hear about ScholarBee?
            </Typography>
            <Controller
              name="referralSource"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    sx={styles.radioGroup}
                  >
                    <FormControlLabel
                      value={DiscoveryMode.TikTok}
                      control={<Radio sx={styles.radio} />}
                      label="TikTok"
                      sx={styles.radioLabel}
                    />
                    <FormControlLabel
                      value={DiscoveryMode.Instagram}
                      control={<Radio sx={styles.radio} />}
                      label="Instagram"
                      sx={styles.radioLabel}
                    />
                    <FormControlLabel
                      value={DiscoveryMode.Facebook}
                      control={<Radio sx={styles.radio} />}
                      label="Facebook"
                      sx={styles.radioLabel}
                    />
                    <FormControlLabel
                      value={DiscoveryMode.Others}
                      control={<Radio sx={styles.radio} />}
                      label="Other"
                      sx={styles.radioLabel}
                    />
                    <FormControlLabel
                      value={DiscoveryMode.Invitation}
                      control={<Radio sx={styles.radio} />}
                      label="Invitation"
                      sx={styles.radioLabel}
                    />
                  </RadioGroup>
                  {errors.referralSource && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{ mt: 0.5 }}
                    >
                      {errors.referralSource.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Conditional Referral Code Field */}
            {referralSource === DiscoveryMode.Invitation && (
              <Box sx={{ mt: 2, width: '100%' }}>
                <Typography sx={styles.referralTitle}>
                  Enter Referral Code
                </Typography>
                <AuthInput
                  name="referralCode"
                  control={control}
                  placeholder=""
                  errors={errors}
                />
              </Box>
            )}
          </Box>

          {/* Terms Checkbox */}
          {/* <Box sx={styles.checkboxContainer}>
            <Controller
              name="agree"
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  checked={field.value || false}
                  size="small"
                  sx={{
                    p: 0,
                    color: '#004AE0',
                    '&.Mui-checked': { color: '#004AE0' }
                  }}
                />
              )}
            />
            <Typography sx={styles.checkboxText}>
              Agree to our{' '}
              <Link href="/terms-and-conditions" sx={styles.checkboxLink}>
                Terms and Conditions
              </Link>{' '}
              &{' '}
              <Link href="/privacy-policy" sx={styles.checkboxLink}>
                Privacy Policy
              </Link>
            </Typography>
          </Box>
          {errors.agree && (
            <Typography color="error" variant="caption" sx={{ ml: 4 }}>
              {errors.agree.message}
            </Typography>
          )} */}

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={styles.submitButton}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign Up'
            )}
          </Button>
        </Box>

        {/* Divider */}
        <Box sx={styles.dividerBox}>
          <Box sx={styles.dividerLine} />
          <Typography sx={styles.dividerText}>Or Sign up with</Typography>
          <Box sx={styles.dividerLine} />
        </Box>

        {/* Social Login */}
        <Box sx={styles.socialButtonsBox}>
          <Button
            type="button"
            variant="outlined"
            sx={styles.socialButton}
            onClick={handleGoogleLogin}
          >
            <Image src={googleIcon} alt="Google" width={20} height={20} />
            <Box component="span" sx={{ ml: 1 }}>
              Google
            </Box>
          </Button>
        </Box>

        {/* Login Prompt */}
        <Box sx={styles.loginPromptBox}>
          <Typography sx={styles.loginPromptText}>
            Already have an account?
            <Link href="/login" sx={styles.loginLink}>
              Login
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

const SignUp: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SignUpFormContent />
  </Suspense>
);

export default SignUp;
