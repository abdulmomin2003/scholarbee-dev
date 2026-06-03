import { COLORS } from '@/constants/colors';
import {
  authFormContainer,
  authHeaderBox,
  authTitle,
  authSubtitle,
  authForm,
  authTextField,
  authCheckboxContainer,
  authCheckboxText,
  authCheckboxLink,
  authPrimaryButton,
  authDividerBox,
  authDividerLine,
  authDividerText,
  authSocialButton,
  authLink,
  authPromptText,
  authPromptBox,
  authPhoneInputContainer
} from '@/styles/authStyles';

export const styles = {
  // Reuse shared auth styles
  formContainer: authFormContainer,
  headerBox: authHeaderBox,
  title: authTitle,
  subtitle: authSubtitle,
  form: authForm,
  textField: authTextField,
  checkboxContainer: authCheckboxContainer,
  checkboxText: authCheckboxText,
  checkboxLink: authCheckboxLink,
  phoneInputContainer: authPhoneInputContainer,
  submitButton: authPrimaryButton,
  dividerBox: authDividerBox,
  dividerLine: authDividerLine,
  dividerText: authDividerText,
  loginPromptBox: authPromptBox,
  loginPromptText: authPromptText,
  loginLink: authLink,

  // Referral-specific styles
  referralContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: { xs: '8px', md: '12px' },
    mt: 1
  },

  referralTitle: {
    fontSize: { xs: '14px', md: '16px' },
    color: COLORS.textPrimary,
    mb: { xs: 0.5, md: 1 }
  },

  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: '6px', md: '8px' }
  },

  radio: {
    color: COLORS.borderColor,
    p: { xs: '2px', md: '4px' },
    '&.Mui-checked': { color: '#004AE0' },
    '& .MuiSvgIcon-root': { fontSize: { xs: '20px', md: '24px' } }
  },

  radioLabel: {
    m: 0,
    '& .MuiFormControlLabel-label': {
      fontSize: { xs: '14px', md: '16px' },
      color: COLORS.textPrimary,
      fontWeight: 500
    }
  },

  socialButtonsBox: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: { xs: 1.5, md: 2 },
    width: '100%'
  },

  socialButton: {
    ...authSocialButton,
    flex: 1
  }
};
