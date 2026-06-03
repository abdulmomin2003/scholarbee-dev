'use client';

import { Button } from '@mui/material';

export default function ProgramDetailsBackButton() {
  return (
    <Button
      variant="contained"
      onClick={() => globalThis.history.back()}
      sx={{ mr: 2 }}
    >
      Go Back
    </Button>
  );
}
