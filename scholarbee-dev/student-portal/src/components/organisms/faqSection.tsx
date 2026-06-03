import CustomAccordion from '@/components/molecules/accordian';
import { Box, Container, Typography } from '@mui/material';
import React from 'react';
import { FAQ_DATA } from '@/constants';

const styles = {
  root: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    pt: { xs: 4, md: 5 },
    pb: { xs: 2, md: 2.5 },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: { xs: '100%', md: '1296px' },
    minHeight: { xs: 'auto', md: '617px' },
    background: '#FFFFFF',
    borderRadius: '16px',
    py: { xs: 3, md: 4 },
    px: { xs: 2, md: 4 },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  title: {
    fontWeight: 600,
    color: '#070808',
    textAlign: 'center',
    mb: { xs: 3, md: 4 }
  }
};

const FAQSection = () => {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <Box sx={styles.root} data-test-id="faq-section-root">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Container maxWidth={false} sx={styles.container}>
        <Typography component="h2" variant="h4" sx={styles.title}>
          Frequently Asked Questions
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: '#444850',
            mb: { xs: 2, md: 3 },
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          We help students with admissions and scholarships at the desired
          universities.
        </Typography>
        <CustomAccordion />
      </Container>
    </Box>
  );
};

export default FAQSection;
