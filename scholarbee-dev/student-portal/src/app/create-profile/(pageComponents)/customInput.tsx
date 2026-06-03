import {
  Autocomplete,
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useMemo, useState } from 'react';
import { UtilsApi } from '@/endpoints/utils';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

interface MarksGPA {
  total_marks_gpa: string;
  obtained_marks_gpa: string;
}

interface CustomInputProps {
  label?: string;
  type: string;
  value: string | MarksGPA | undefined;
  onChange: (value: string | MarksGPA) => void;
  onChangeWithDependency?: (value: string | MarksGPA) => void; // Add this line
  options?: { value: string; label: string }[];
  required?: boolean;
  isDouble?: boolean;
  placeholder?: string;
  displayEmpty?: boolean;
  placeholderLabel?: string;
  name?: string;
  error?: boolean;
  helperText?: string;
  notEditable?: boolean;
  uniqueId?: string;
  disabled?: boolean;
  renderAdditionalTitle?: React.ReactNode;
  scholarship?: boolean;
}

const CustomInput = ({
  label,
  type,
  value,
  onChange,
  onChangeWithDependency,
  options,
  required,
  placeholder,
  isDouble = false,
  placeholderLabel,
  error,
  helperText,
  notEditable,
  uniqueId,
  disabled,
  renderAdditionalTitle,
  name
}: CustomInputProps) => {
  const token = Cookies.get('access_token');
  const utilsApi = useMemo(() => new UtilsApi(token || ''), [token]);

  const [loading, setLoading] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Validate file size (2MB limit)
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        toast.error(
          'File size exceeds the 2MB limit. Please upload a smaller file.'
        );
        event.target.value = '';
        return;
      }

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        const response = await utilsApi.uploadMedia(formData);

        if (response?.success) {
          const fileUrl = `https://storage.googleapis.com/scholarbee-general-assets/${encodeURIComponent(response?.data.doc.filename)}`;
          onChange(fileUrl);
        } else {
          console.error('File upload failed:', response);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    setInputKey(Date.now());
  };

  const inputId = uniqueId || `file-upload-${label || ''}`;

  let maxDate;
  if (type === 'date' && name === 'date_of_birth') {
    maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 15))
      .toISOString()
      .split('T')[0];
  } else if (type === 'date') {
    maxDate = new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split('T')[0];
  }

  if (isDouble && typeof value === 'object' && 'total_marks_gpa' in value) {
    return (
      <Box>
        <Typography fontWeight={500} display="flex" mb={1}>
          {label}
          {required && (
            <Typography component="span" color="error.main">
              *
            </Typography>
          )}
        </Typography>
        <Box sx={styles.doubleInputContainer}>
          <TextField
            fullWidth
            value={value.total_marks_gpa || ''}
            type="number"
            onChange={(e) =>
              onChange({
                ...value,
                total_marks_gpa: e.target.value
              })
            }
            sx={{
              ...styles.textField,
              ...styles.leftField,
              ...(type === 'number' && styles.numberInput)
            }}
            placeholder="Total Marks/GPA"
            variant="outlined"
            error={error}
            disabled={disabled}
          />
          <Box sx={styles.divider} />
          <TextField
            fullWidth
            type="number"
            value={value.obtained_marks_gpa || ''}
            onChange={(e) =>
              onChange({
                ...value,
                obtained_marks_gpa: e.target.value
              })
            }
            sx={{
              ...styles.textField,
              ...styles.rightField,
              ...(type === 'number' && styles.numberInput)
            }}
            placeholder="Obtained Marks/GPA"
            variant="outlined"
            error={error}
            disabled={disabled}
          />
        </Box>
        {helperText && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              marginTop: '3px',
              marginLeft: '14px',
              marginRight: '14px',
              fontSize: '0.75rem',
              lineHeight: 1.66
            }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    );
  } else if (type === 'select') {
    return (
      <FormControl fullWidth error={error}>
        <Typography fontWeight={500} mb={1} display="flex">
          {label}
          {required && (
            <Typography component="span" color="error.main">
              *
            </Typography>
          )}
        </Typography>
        <Autocomplete
          value={options?.find((option) => option.value === value) || null}
          onChange={(_, newValue) => {
            onChange(newValue ? newValue.value : '');
            // If onChangeWithDependency is provided, call it to handle dependent fields
            if (onChangeWithDependency) {
              onChangeWithDependency(newValue ? newValue.value : '');
            }
          }}
          options={options || []}
          getOptionLabel={(option) => option.label}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholderLabel || placeholder}
              error={error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: disabled ? '#f5f5f5' : 'transparent',
                  '& fieldset': {
                    borderColor: error ? 'error.main' : 'rgba(0, 0, 0, 0.23)'
                  }
                }
              }}
            />
          )}
          sx={{
            '& .MuiAutocomplete-endAdornment': {
              top: '50%',
              transform: 'translateY(-50%)',
              right: 9
            }
          }}
        />
        {helperText && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              marginTop: '3px',
              marginLeft: '14px',
              marginRight: '14px',
              fontSize: '0.75rem',
              lineHeight: 1.66
            }}
          >
            {helperText}
          </Typography>
        )}
      </FormControl>
    );
  } else if (type === 'file') {
    const fileValue = value as string;

    return (
      <Box>
        <Typography fontWeight={500} display="flex" mb={1}>
          {label}
          {required && (
            <Typography component="span" color="error.main">
              *
            </Typography>
          )}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            padding: `${fileValue ? '8px' : '16px'} 12px`,
            backgroundColor: '#f9f9f9',
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
            minHeight: '56px'
          }}
        >
          <input
            key={inputKey}
            id={inputId}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept=".JPG,.PDF,.PNG,"
            disabled={disabled}
          />
          <label
            htmlFor={inputId}
            style={{
              width: '100%',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Typography
                  sx={{
                    color: fileValue ? '#000' : '#9e9e9e',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    lineHeight: 1.2
                  }}
                  title={fileValue ? fileValue.split('/').pop() : undefined}
                >
                  {fileValue
                    ? fileValue.split('/').pop()
                    : placeholder || 'Choose a file'}
                </Typography>
                <Box sx={{ flexShrink: 0 }}>
                  {fileValue ? (
                    <IconButton
                      onClick={handleClearFile}
                      disabled={disabled}
                      size="small"
                      sx={{
                        padding: { xs: '4px', sm: '8px' }
                      }}
                    >
                      <ClearIcon
                        sx={{ fontSize: { xs: '18px', sm: '24px' } }}
                      />
                    </IconButton>
                  ) : (
                    <CloudUploadIcon
                      sx={{
                        color: '#1976d2',
                        fontSize: { xs: '20px', sm: '24px' }
                      }}
                    />
                  )}
                </Box>
              </>
            )}
          </label>
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            marginTop: '4px',
            marginLeft: '4px',
            color: '#64748B',
            fontSize: '0.75rem'
          }}
        >
          Max file size: 2MB
        </Typography>
        {helperText && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              marginTop: '3px',
              marginLeft: '14px',
              marginRight: '14px',
              fontSize: '0.75rem',
              lineHeight: 1.66
            }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={500} display="flex" mb={1}>
          {label}
          {required && (
            <Typography component="span" color="error.main">
              *
            </Typography>
          )}
        </Typography>
        {renderAdditionalTitle || <Box />}
      </Box>

      <TextField
        fullWidth
        type={type}
        {...(type === 'textarea' ? { multiline: true, rows: 3 } : {})}
        value={
          type === 'date'
            ? typeof value === 'string'
              ? value.slice(0, 10)
              : ''
            : (value as string)
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = event.target.value;

          // Prevent invalid values for income fields
          if (
            type === 'number' &&
            (name === 'father_income' || name === 'mother_income') &&
            newValue !== ''
          ) {
            const numValue = parseFloat(newValue);
            if (numValue < 0 || numValue > 1000000000) {
              return; // Don't update if outside valid range
            }
          }

          onChange(newValue);
        }}
        slotProps={{
          input: {
            inputProps: {
              max: maxDate,
              ...(type === 'number' &&
                (name === 'father_income' || name === 'mother_income') && {
                  min: 0,
                  max: 1000000000,
                  step: 'any'
                })
            }
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2
          },
          ...(type === 'number' && styles.numberInput)
        }}
        error={error}
        helperText={helperText}
        disabled={notEditable || disabled}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default CustomInput;

const styles = {
  doubleInputContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
    height: '56px',
    '&:hover': {
      borderColor: 'rgba(0, 0, 0, 0.87)'
    }
  },
  textField: {
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    },
    '& .MuiInputBase-input': {
      padding: '16.5px 14px'
    },
    '& .MuiOutlinedInput-root': {
      height: '100%'
    }
  },
  leftField: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  rightField: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  },
  divider: {
    width: '1px',
    backgroundColor: 'rgba(0, 0, 0, 0.23)',
    height: 'calc(100% - 20px)',
    alignSelf: 'center'
  },
  numberInput: {
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
      '&::-webkit-outer-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0
      },
      '&::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0
      }
    }
  }
};
