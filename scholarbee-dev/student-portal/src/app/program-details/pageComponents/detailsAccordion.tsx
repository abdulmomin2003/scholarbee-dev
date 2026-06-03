'use client';
import React, { ReactNode, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import Image from 'next/image';
// import dollarIcon from '@public/assets/svg/dollar-circle.svg';
import { CustomTypography } from '@/components/atoms/customTypography';
import { COLORS } from '@/constants/colors';

const DetailsAccordion = ({
  summary,
  details,
  extendedSummary,
  FEE_DATA = []
}: {
  summary?: ReactNode;
  details?: ReactNode;
  extendedSummary?: ReactNode;
  FEE_DATA?: {
    id: number;
    amount: string;
    label: string;
    description: string;
  }[];
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleChange = (isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Box sx={styles.root}>
      <Accordion
        disableGutters={true}
        expanded={expanded}
        onChange={() => handleChange(!expanded)}
        sx={{
          ...styles.accordion,
          'MuiAccordion-root': {
            padding: '0px',
            margin: '0px'
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{
            minHeight: 'unset',
            '&.Mui-expanded': {
              minHeight: 'unset'
            },
            '& .MuiAccordionSummary-content': {}
          }}
        >
          {expanded && extendedSummary ? extendedSummary : summary}
        </AccordionSummary>
        <AccordionDetails>
          {details || (
            <>
              {FEE_DATA?.map((fee, index) => (
                <Box key={index}>
                  {fee.id !== 1 && (
                    <Box display="flex" mt={3} alignItems="center" gap={1}>
                      <CustomTypography
                        variant="h5"
                        fontSize={24}
                        smallFont={18}
                        fontWeight={500}
                      >
                        {fee.amount}
                      </CustomTypography>
                      <Typography variant="body1" fontSize={14}>
                        {fee.label}
                      </Typography>
                    </Box>
                  )}
                  <Typography
                    variant="body1"
                    sx={{ mt: fee.id === 1 ? -1.5 : 1.5 }}
                  >
                    {fee.description}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

const styles = {
  root: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    mb: 3,
    backgroundColor: COLORS.bgColor
  },
  accordion: {
    backgroundColor: COLORS.bgColor,
    borderRadius: '8px'
  }
};

export default DetailsAccordion;
