import {
  authFormContainer,
  authHeaderBox,
  authTitle,
  authSubtitle,
  authForm,
  authPrimaryButton,
  authPromptText,
  authPromptBox,
  authLink
} from '@/styles/authStyles';

export const styles = {
  formContainer: authFormContainer,
  headerBox: authHeaderBox,
  title: authTitle,
  subtitle: authSubtitle,
  form: {
    ...authForm,
    mt: { xs: 1, md: 1 }
  },
  loginPromptBox: authPromptBox,
  loginPromptText: authPromptText,
  loginLink: authLink,

  // Verification-specific styles
  verifyButton: {
    ...authPrimaryButton,
    mt: 0
  },

  successBox: {
    bgcolor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: { xs: '10px', md: '12px' },
    p: { xs: 2, md: 2.5 },
    mt: { xs: 2, md: 3 }
  },

  successText: {
    fontSize: { xs: '14px', md: '16px' },
    color: '#4CAF50',
    fontWeight: 600,
    textAlign: 'center'
  }
};
