'use client';
import React from 'react';
import { Box, Container, Button } from '@mui/material';

interface ProgramToggleButtonsProps {
  showScholarships: boolean;
  onToggle: (showScholarships: boolean) => void;
  styles: any;
}

const ProgramToggleButtons: React.FC<ProgramToggleButtonsProps> = ({
  showScholarships,
  onToggle,
  styles
}) => {
  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb: { xs: 1.5, md: 2 },
        pt: { xs: 1, md: 0 }
      }}
    >
      <Box sx={styles.switchButtons}>
        <Button
          onClick={() => onToggle(false)}
          sx={{
            ...styles.button,
            ...(!showScholarships && styles.activeButton)
          }}
          variant={!showScholarships ? 'contained' : 'text'}
        >
          Programs
        </Button>
        <Button
          onClick={() => onToggle(true)}
          sx={{
            ...styles.button,
            ...(showScholarships && styles.activeButton)
          }}
          variant={showScholarships ? 'contained' : 'text'}
        >
          Scholarships
        </Button>
      </Box>
    </Container>
  );
};

export default ProgramToggleButtons;
