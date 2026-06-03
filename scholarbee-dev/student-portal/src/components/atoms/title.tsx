import { Typography } from '@mui/material';
import React from 'react';

const Title = ({
  title,
  ...props
}: {
  title: string;
  [key: string]: string;
}) => {
  return (
    <Typography
      component="h1"
      variant="h2"
      sx={styles.title}
      data-test-id="title"
      {...props}
    >
      {title}
    </Typography>
  );
};

export default Title;

const styles = {
  title: {
    fontWeight: 600,
    mt: 1
  }
};
