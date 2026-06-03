import {
  authFormContainer,
  authHeaderBox,
  authTitle,
  authSubtitle,
  authForm,
  authTextField,
  authPrimaryButton,
  authPromptBox,
  authPromptText,
  authLink
} from '@/styles/authStyles';

export const styles = {
  formContainer: authFormContainer,
  headerBox: authHeaderBox,
  title: authTitle,
  subtitle: authSubtitle,
  form: authForm,
  textField: authTextField,
  submitButton: {
    ...authPrimaryButton,
    mt: 3,
    mb: 2
  },
  loginPromptBox: authPromptBox,
  loginPromptText: authPromptText,
  loginLink: authLink,

  // Custom for this page if needed, otherwise rely on shared
  innerBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    px: 2
  }
};
