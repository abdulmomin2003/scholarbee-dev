'use client';
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/system';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FAQ_DATA } from '@/constants';

const styles = {
  container: {
    width: '100%',
    maxWidth: { xs: '100%', md: '820px' },
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 2, md: 3 }
  },
  accordionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  questionRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: { xs: 2, md: '45px' }
  },
  question: {
    fontWeight: 500,
    color: '#212327',
    flex: 1
  },
  answer: {
    fontWeight: 400,
    color: '#444850',
    lineHeight: '24px'
  },
  divider: {
    width: '100%',
    height: '0.5px',
    border: '0.5px solid #9B9FA7',
    borderWidth: '0.5px 0 0 0'
  }
};

const StyledAccordion = styled(Accordion)(() => ({
  backgroundColor: '#FFFFFF',
  boxShadow: 'none',
  '&:before': {
    display: 'none'
  },
  '&.Mui-expanded': {
    margin: 0
  }
}));

const StyledAccordionSummary = styled(AccordionSummary)(() => ({
  backgroundColor: '#FFFFFF',
  padding: 0,
  minHeight: '33px',
  '&.Mui-expanded': {
    minHeight: '33px'
  },
  '& .MuiAccordionSummary-content': {
    margin: 0,
    '&.Mui-expanded': {
      margin: 0
    }
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: '#014AE0',
    transform: 'rotate(0deg)',
    transition: 'transform 0.2s ease-in-out',
    '&.Mui-expanded': {
      transform: 'rotate(180deg)'
    }
  }
}));

const StyledAccordionDetails = styled(AccordionDetails)(() => ({
  backgroundColor: '#FFFFFF',
  padding: 0,
  paddingTop: '16px'
}));

const AccordionContent = () => {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  return (
    <Box sx={styles.container}>
      {FAQ_DATA.map((item, index) => (
        <Box key={item.id} sx={styles.accordionItem}>
          <StyledAccordion
            expanded={expanded === item.id}
            onChange={handleChange(item.id)}
            data-test-id={`accordion-${item.id}`}
          >
            <StyledAccordionSummary
              expandIcon={<KeyboardArrowDownIcon />}
              data-test-id={`accordion-summary-${item.id}`}
            >
              <Box sx={styles.questionRow}>
                <Typography variant="h6" sx={styles.question}>
                  {item.question}
                </Typography>
              </Box>
            </StyledAccordionSummary>
            <StyledAccordionDetails
              data-test-id={`accordion-details-${item.id}`}
            >
              <Typography variant="body1" sx={styles.answer}>
                {item.answer}
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>
          {index < FAQ_DATA.length - 1 && <Box sx={styles.divider} />}
        </Box>
      ))}
    </Box>
  );
};

export default AccordionContent;
