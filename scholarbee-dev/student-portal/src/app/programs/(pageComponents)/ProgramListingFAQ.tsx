'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/system';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export interface FAQItem {
  question: string;
  answer: string;
}

interface ProgramListingFAQProps {
  items: FAQItem[];
  /** Optional heading above the FAQ (e.g. "Frequently Asked Questions") */
  heading?: string;
  /** Optional subtitle below the heading */
  subtitle?: string;
}

const styles = {
  root: {
    backgroundColor: '#FFFFFF',
    position: 'relative' as const,
    pt: { xs: 4, md: 5 },
    pb: { xs: 2, md: 2.5 },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: { xs: '100%', md: '1296px' },
    minHeight: { xs: 'auto' },
    background: '#FFFFFF',
    borderRadius: '16px',
    py: { xs: 3, md: 4 },
    px: { xs: 2, md: 4 },
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  title: {
    fontWeight: 600,
    color: '#070808',
    textAlign: 'center' as const,
    mb: { xs: 3, md: 4 }
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#444850',
    mb: { xs: 2, md: 3 },
    maxWidth: '600px',
    mx: 'auto'
  },
  accordionWrapper: {
    width: '100%',
    maxWidth: { xs: '100%', md: '820px' },
    display: 'flex',
    flexDirection: 'column' as const,
    gap: { xs: 2, md: 3 }
  },
  accordionItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2
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

/**
 * FAQ section with JSON-LD schema markup for SEO.
 * Design matches FAQSection / CustomAccordion used elsewhere.
 */
export function ProgramListingFAQ({
  items,
  heading = 'Frequently Asked Questions',
  subtitle
}: ProgramListingFAQProps) {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <Box
      component="section"
      sx={styles.root}
      data-test-id="program-listing-faq-root"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Container maxWidth={false} sx={styles.container}>
        <Typography component="h2" variant="h4" sx={styles.title}>
          {heading}
        </Typography>
        {subtitle && (
          <Typography variant="body1" sx={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
        <Box sx={styles.accordionWrapper}>
          {items.map((item, index) => (
            <Box key={item.question} sx={styles.accordionItem}>
              <StyledAccordion
                expanded={expanded === item.question}
                onChange={handleChange(item.question)}
                data-test-id={`program-faq-accordion-${index}`}
              >
                <StyledAccordionSummary
                  expandIcon={<KeyboardArrowDownIcon />}
                  data-test-id={`program-faq-summary-${index}`}
                >
                  <Typography variant="h6" sx={styles.question}>
                    {item.question}
                  </Typography>
                </StyledAccordionSummary>
                <StyledAccordionDetails
                  data-test-id={`program-faq-details-${index}`}
                >
                  <Typography variant="body1" sx={styles.answer}>
                    {item.answer}
                  </Typography>
                </StyledAccordionDetails>
              </StyledAccordion>
              {index < items.length - 1 && <Box sx={styles.divider} />}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

/** Default FAQ items for program listing pages (Level 1 & 2). */
export const DEFAULT_PROGRAM_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I apply for a program listed here?',
    answer:
      "Each program card links to the university's admission page or application portal. You can also use ScholarBee's compare and shortlist features to track deadlines and requirements before applying directly to the institution."
  },
  {
    question: 'What eligibility criteria do I need to meet?',
    answer:
      "Eligibility varies by university and program. Typically you need to have completed intermediate (FSc/FA/ICS or equivalent) with the required subjects and minimum marks. Check the specific program page and the university's admission policy for exact criteria."
  },
  {
    question: 'When do admissions open for these programs?',
    answer:
      'Admission cycles differ by university and program. Many universities have fall and spring intakes. Use the filters on this page to see opening and closing dates, and always confirm deadlines on the official university website.'
  },
  {
    question: 'Can I compare fees across universities?',
    answer:
      'Yes. Program cards show fee information where available. You can use the fee filter on this page and the Compare Universities tool on ScholarBee to compare programs side by side.'
  }
];
