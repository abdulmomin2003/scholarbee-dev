import {
  Controller,
  Control,
  FieldValues,
  Path,
  FieldErrors
} from 'react-hook-form';
import { TextField, InputAdornment } from '@mui/material';
import Image from 'next/image';
import { authTextField } from '@/styles/authStyles';

interface AuthInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  placeholder: string;
  type?: string;
  errors?: FieldErrors<T>;
  startIcon?: string;
  endIcon?: React.ReactNode;
  autoComplete?: string;
  autoFocus?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  fullWidth?: boolean;
}

const AuthInput = <T extends FieldValues>({
  name,
  control,
  placeholder,
  type = 'text',
  errors,
  startIcon,
  endIcon,
  autoComplete,
  autoFocus,
  onKeyPress,
  fullWidth = true
}: AuthInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth={fullWidth}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onKeyPress={onKeyPress}
          error={!!errors?.[name]}
          helperText={errors?.[name]?.message as string}
          sx={authTextField}
          InputProps={{
            startAdornment: startIcon ? (
              <InputAdornment position="start">
                <Image src={startIcon} alt={name} width={20} height={20} />
              </InputAdornment>
            ) : null,
            endAdornment: endIcon ? (
              <InputAdornment position="end">{endIcon}</InputAdornment>
            ) : null
          }}
        />
      )}
    />
  );
};

export default AuthInput;
