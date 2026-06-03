import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import Image from 'next/image';
import AuthInput from './AuthInput';
import { Control, FieldValues, Path, FieldErrors } from 'react-hook-form';
import eyeIcon from '@public/assets/svg/eye.svg';
import eyeSlashIcon from '@public/assets/svg/eye-slash.svg';
import lockIcon from '@public/assets/svg/lock-outlined.svg';

interface AuthPasswordInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  errors?: FieldErrors<T>;
  autoComplete?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

const AuthPasswordInput = <T extends FieldValues>({
  name,
  control,
  placeholder = 'Password',
  errors,
  autoComplete = 'current-password',
  onKeyPress
}: AuthPasswordInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthInput
      name={name}
      control={control}
      placeholder={placeholder}
      type={showPassword ? 'text' : 'password'}
      errors={errors}
      startIcon={lockIcon}
      autoComplete={autoComplete}
      onKeyPress={onKeyPress}
      endIcon={
        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
          <Image
            src={showPassword ? eyeSlashIcon : eyeIcon}
            alt="Toggle password visibility"
            width={20}
            height={20}
          />
        </IconButton>
      }
    />
  );
};

export default AuthPasswordInput;
