import {
  authFormContainer,
  authHeaderBox,
  authTitle,
  authSubtitle,
  authForm,
  authTextField,
  authPrimaryButton,
  authDividerBox,
  authDividerLine,
  authDividerText,
  authSocialButton,
  authLink,
  authPromptText,
  authPromptBox
} from '@/styles/authStyles';

export const styles = {
  // Reuse shared auth styles
  formContainer: authFormContainer,
  headerBox: authHeaderBox,
  title: authTitle,
  subtitle: authSubtitle,
  form: authForm,
  textField: authTextField,
  submitButton: authPrimaryButton,
  dividerBox: authDividerBox,
  dividerLine: authDividerLine,
  dividerText: authDividerText,
  signUpPromptBox: authPromptBox,
  signUpPromptText: authPromptText,
  signUpLink: authLink,

  // Login-specific styles
  forgotPasswordBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    mt: { xs: -0.5, md: -1 }
  },

  forgotPasswordLink: {
    fontSize: { xs: '13px', md: '14px' },
    color: '#004AE0',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },

  googleButton: authSocialButton
};
