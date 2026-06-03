'use client';
import React from 'react';
import { Box, Button } from '@mui/material';

const SwitchButtons = () => {
  const [selectButton, setSelectButton] = React.useState('1');

  return (
    <Box sx={styles.switchButtons}>
      <Button
        onClick={() => setSelectButton('1')}
        sx={styles.button}
        variant={selectButton === '1' ? 'contained' : 'text'}
      >
        Programs
      </Button>
      <Button
        onClick={() => setSelectButton('2')}
        sx={styles.button}
        variant={selectButton === '2' ? 'contained' : 'text'}
      >
        Scholarships
      </Button>
    </Box>
  );
};

export default SwitchButtons;

const styles = {
  switchButtons: {
    mt: 5,
    borderRadius: 2,
    padding: 0.5,
    backgroundColor: 'white',
    maxWidth: '420px',
    width: '100%'
  },
  button: {
    maxWidth: '50%',
    width: '100%'
  }
};
