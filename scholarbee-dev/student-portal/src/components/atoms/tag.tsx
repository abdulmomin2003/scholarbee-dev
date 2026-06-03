import React from 'react';
import { Box, SxProps, Typography } from '@mui/material';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface TagProps {
  icon: string | StaticImport;
  title: string;
  bgWhite?: boolean;
  alignSelf?: string;
  sx?: SxProps;
}

const Tag = ({ icon, title, bgWhite, alignSelf, sx, ...props }: TagProps) => {
  return (
    <Box
      data-test-id="tag-container"
      {...(alignSelf && { alignSelf: 'center' })}
      sx={{
        backgroundColor: bgWhite ? 'white' : '#F4F7FF',
        padding: '18px 24px',
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        maxWidth: 'fit-content',
        ...sx
      }}
      {...props}
    >
      <Image
        src={icon}
        alt="icon"
        width={30}
        height={30}
        data-test-id="tag-icon"
        priority
      />
      <Typography variant="h6" ml="10px" data-test-id="tag-title">
        {title}
      </Typography>
    </Box>
  );
};

export default Tag;
