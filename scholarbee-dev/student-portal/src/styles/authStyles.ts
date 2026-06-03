import { COLORS } from '@/constants/colors';

export const flexCenter = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
} as const;

export const absoluteFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
} as const;

// Typography styles
export const authTitle = {
  fontWeight: 700,
  fontSize: { xs: '24px', sm: '28px', md: '32px' },
  lineHeight: { xs: '32px', sm: '36px', md: '40px' },
  color: COLORS.textPrimary,
  mb: { xs: 0.5, md: 1 }
} as const;

export const authSubtitle = {
  fontWeight: 400,
  fontSize: { xs: '14px', md: '16px' },
  lineHeight: { xs: '20px', md: '24px' },
  color: 'rgba(37, 37, 37, 0.7)'
} as const;

// Form container
export const authFormContainer = {
  width: { xs: '100%', sm: '100%', md: '480px' },
  minWidth: { xs: '100%', sm: '420px', md: '480px' },
  px: { xs: 0, sm: 2 },
  pb: { xs: 8, md: 0 },
  gap: { xs: 2, md: 3 },
  ...flexCenter
} as const;

// Header box
export const authHeaderBox = {
  textAlign: 'center',
  mb: { xs: 1, md: 0 }
} as const;

// Form styles
export const authForm = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 1.5, md: 2 }
} as const;

// Text field styles
export const authTextField = {
  '& .MuiOutlinedInput-root': {
    borderRadius: { xs: '10px', md: '12px' },
    height: { xs: '48px', md: '56px' },
    bgcolor: COLORS.white,
    '& fieldset': { borderColor: COLORS.borderColor },
    '&:hover fieldset': { borderColor: '#004AE0' },
    '&.Mui-focused fieldset': { borderColor: '#004AE0' }
  },
  '& .MuiInputBase-input': {
    fontSize: { xs: '14px', md: '16px' },
    color: COLORS.textPrimary,
    '&::placeholder': { color: COLORS.placeholder, opacity: 1 }
  }
} as const;

// Button styles
export const authPrimaryButton = {
  height: { xs: '48px', md: '56px' },
  bgcolor: '#004AE0',
  borderRadius: { xs: '10px', md: '12px' },
  textTransform: 'none',
  fontSize: { xs: '14px', md: '16px' },
  fontWeight: 600,
  mt: { xs: 0.5, md: 1 },
  '&:hover': { bgcolor: '#003BB5' },
  '&.Mui-disabled': { bgcolor: 'rgba(0, 74, 224, 0.5)', color: COLORS.white }
} as const;

export const authSocialButton = {
  height: { xs: '48px', md: '56px' },
  borderRadius: { xs: '10px', md: '12px' },
  border: `1px solid ${COLORS.borderColor}`,
  textTransform: 'none',
  fontSize: { xs: '14px', md: '16px' },
  minWidth: '190px',
  fontWeight: 600,
  color: COLORS.textPrimary,
  '&:hover': {
    bgcolor: '#F8F9FB',
    borderColor: '#004AE0'
  }
} as const;

// Divider styles
export const authDividerBox = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 1.5, md: 2 },
  my: { xs: 0.5, md: 1 }
} as const;

export const authDividerLine = {
  flexGrow: 1,
  height: '1px',
  bgcolor: COLORS.borderColor
} as const;

export const authDividerText = {
  fontSize: { xs: '12px', md: '14px' },
  color: COLORS.lightGray,
  whiteSpace: 'nowrap'
} as const;

// Link styles
export const authLink = {
  color: '#004AE0',
  textDecoration: 'none',
  ml: 0.5,
  '&:hover': {
    textDecoration: 'underline'
  }
} as const;

export const authPromptText = {
  fontSize: { xs: '14px', md: '16px' },
  color: COLORS.textPrimary
} as const;

export const authPromptBox = {
  textAlign: 'center',
  mt: { xs: 0.5, md: 1 }
} as const;

// Checkbox styles
export const authCheckboxContainer = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: { xs: 1, md: 1.5 },
  mt: 0.5
} as const;

export const authCheckboxText = {
  fontSize: { xs: '13px', md: '14px' },
  lineHeight: { xs: '18px', md: '20px' },
  color: COLORS.textPrimary
} as const;

export const authCheckboxLink = {
  color: '#004AE0',
  fontWeight: 600,
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' }
} as const;

// Phone input styles
export const authPhoneInputContainer = {
  width: '100%',
  '& .phone-input-field': {
    display: 'flex',
    alignItems: 'center',
    borderRadius: { xs: '10px', md: '12px' },
    p: { xs: '0 12px', md: '0 14px' },
    height: { xs: '48px', md: '56px' },
    fontSize: { xs: '14px', md: '16px' },
    border: `1px solid ${COLORS.borderColor}`,
    bgcolor: COLORS.white,
    '&:hover': { borderColor: '#004AE0' },
    '&:focus-within': {
      borderColor: '#004AE0',
      borderWidth: '2px'
    },
    '&.error': { borderColor: '#d32f2f' }
  },
  '& .PhoneInputInput': {
    border: 'none',
    outline: 'none',
    width: '100%',
    height: '100%',
    fontSize: { xs: '14px', md: '16px' },
    color: COLORS.textPrimary,
    '&::placeholder': { color: COLORS.placeholder, opacity: 1 }
  }
} as const;
