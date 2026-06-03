'use client';
import React from 'react';
import { Button, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface ContactUsButtonProps {
  styles: {
    button: SxProps<Theme>;
    buttonText: SxProps<Theme>;
  };
}

const ContactUsButton: React.FC<ContactUsButtonProps> = ({ styles }) => {
  const handleButtonClick = () => {
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSefg8SuTUa1wSa3mvnH3MaJKF9Dlpu9iI74jfZd0PEyjmiNiw/viewform?usp=dialog',
      '_blank'
    );
  };

  return (
    <Button sx={styles.button} onClick={handleButtonClick}>
      <Typography
        variant="body1"
        fontWeight={500}
        sx={{
          ...styles.buttonText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        Contact Us
      </Typography>
    </Button>
  );
};

export default ContactUsButton;
