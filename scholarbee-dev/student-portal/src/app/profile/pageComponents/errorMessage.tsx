import { Alert } from '@mui/material';

const ErrorMessage = ({ message }: { message: string }) => (
  <Alert severity="error" sx={{ m: 2 }}>
    {message}
  </Alert>
);

export default ErrorMessage;
