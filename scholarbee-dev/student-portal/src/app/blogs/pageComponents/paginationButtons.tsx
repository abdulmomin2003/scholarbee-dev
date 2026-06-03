import { Box, IconButton } from '@mui/material';
import React from 'react';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';

const PaginationButtons = () => {
  return (
    <Box display="flex" justifyContent="center" mt={5} p={1}>
      <Box>
        <IconButton>
          <WestIcon />
        </IconButton>
      </Box>
      <Box sx={{ backgroundColor: '#004ae0' }}>
        <IconButton sx={{ color: 'white' }}>
          <EastIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PaginationButtons;
