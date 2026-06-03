import { Box, Typography } from '@mui/material';
import React from 'react';

import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

type ProgramDetailsInfoProps = {
  infoItems: {
    icon: StaticImport;
    subtitle: string;
    title: string;
    hasDatePassed?: boolean;
  }[];
};

const ProgramDetailsInfo = ({ infoItems }: ProgramDetailsInfoProps) => {
  return (
    <Box gap={1} sx={styles.container}>
      {infoItems.map((item, index) => (
        <Box key={index} sx={styles.infoBox}>
          <Image
            src={item.icon}
            alt={`${item.subtitle} icon`}
            width={32}
            height={32}
          />
          <Box>
            <Typography
              variant="h6"
              color={item.hasDatePassed ? 'error' : 'textPrimary'}
              fontWeight="bold"
            >
              {item.title}
            </Typography>
            <Typography
              color={item.hasDatePassed ? 'error' : 'textPrimary'}
              variant="body2"
              fontSize={14}
            >
              {item.subtitle}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ProgramDetailsInfo;

const styles = {
  container: {
    mt: 4,
    p: 2,
    backgroundColor: 'white',
    borderRadius: 2,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mt: 2
  }
};
