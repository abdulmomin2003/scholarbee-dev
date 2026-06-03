import { Box, Button } from '@mui/material';
import React from 'react';

const ButtonsComponent = ({
  loading,
  goToPrevStep,
  buttonTxt,
  noBackButton,
  gotToHomeFunction,
  disableSubmit,
  submitDisabledText,
  onVerifyEmailClick
}: {
  onClickSave?: () => void;
  goToPrevStep?: () => void;
  buttonTxt?: string;
  loading?: boolean;
  noBackButton?: boolean;
  goBackHome?: boolean;
  gotToHomeFunction?: () => void;
  disableSubmit?: boolean;
  submitDisabledText?: string;
  /** When set with disableSubmit, the primary button is enabled and opens verify modal on click */
  onVerifyEmailClick?: () => void;
}) => {
  const showVerifyButton =
    disableSubmit && submitDisabledText && onVerifyEmailClick;

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      mt={4}
      gap={2}
    >
      {!noBackButton ? (
        <Button
          onClick={gotToHomeFunction || goToPrevStep}
          sx={{ width: '100%', maxWidth: { xs: '35%', sm: '200px' } }}
          variant="outlined"
          disabled={loading}
        >
          {gotToHomeFunction ? 'Back To Home' : 'Back'}
        </Button>
      ) : (
        <Box />
      )}

      {showVerifyButton ? (
        <Button
          type="button"
          onClick={onVerifyEmailClick}
          sx={{ width: '100%', maxWidth: { xs: '70%', sm: '250px' } }}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : submitDisabledText}
        </Button>
      ) : (
        <Button
          type="submit"
          sx={{ width: '100%', maxWidth: { xs: '70%', sm: '250px' } }}
          variant="contained"
          disabled={loading || disableSubmit}
        >
          {loading
            ? 'Saving...'
            : disableSubmit
              ? submitDisabledText || buttonTxt || 'Save & Next'
              : buttonTxt || 'Save & Next'}
        </Button>
      )}
    </Box>
  );
};

export default ButtonsComponent;
