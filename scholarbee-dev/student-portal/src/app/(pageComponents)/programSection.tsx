import React from 'react';
import { Box } from '@mui/material';
import { carouselStyles } from '@/components/molecules/carouselStyles';
import ProgramCarouselContentClient from './programSection/ProgramCarouselContentClient';
import ProgramSectionWrapper from './programSection/ProgramSectionWrapper';
import ProgramCardsGridServer from './programSection/ProgramCardsGridServer';
import ScholarshipsCardsGridServer from './programSection/ScholarshipsCardsGridServer';
import { ElasticsearchAdmissionProgramDocument } from '@/types/admission-program.types';
import { Scholarship } from '@/types/scholarship';
import { HomeScholarshipsResponse } from './programSection/serverData';

interface ProgramsResponse {
  docs: ElasticsearchAdmissionProgramDocument[];
  pagination?: {
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

const ProgramSection = ({
  isScholarship,
  initialPrograms,
  initialScholarships
}: {
  isScholarship?: boolean;
  initialPrograms?: ProgramsResponse | null;
  initialScholarships?: HomeScholarshipsResponse | null;
}) => {
  const hasServerPrograms =
    initialPrograms?.docs != null && initialPrograms.docs.length > 0;
  const scholarshipDocs: Scholarship[] = initialScholarships?.data ?? [];

  return (
    <Box
      sx={{
        ...carouselStyles.section,
        position: 'relative',
        py: { xs: 4, md: 5 }
      }}
    >
      {hasServerPrograms ? (
        <ProgramSectionWrapper
          initialPrograms={initialPrograms}
          initialScholarships={scholarshipDocs}
          isScholarship={isScholarship}
          styles={styles}
          scholarshipsGrid={
            scholarshipDocs.length > 0 ? (
              <ScholarshipsCardsGridServer scholarships={scholarshipDocs} />
            ) : null
          }
        >
          <ProgramCardsGridServer
            programs={initialPrograms.docs}
            seeAllHref={isScholarship ? '/search-scholarship' : '/programs'}
          />
        </ProgramSectionWrapper>
      ) : (
        <ProgramCarouselContentClient
          isScholarship={isScholarship}
          initialPrograms={initialPrograms}
          initialScholarships={scholarshipDocs}
          styles={styles}
        />
      )}
    </Box>
  );
};

export default ProgramSection;

const styles = {
  switchButtons: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '12px',
    padding: '4px',
    backgroundColor: '#FFFFFF',
    maxWidth: { xs: '100%', sm: '420px' },
    width: '100%',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
    gap: '4px'
  },
  button: {
    flex: 1,
    minWidth: { xs: '140px', sm: '180px' },
    textTransform: 'none',
    fontFamily: "'Poppins', sans-serif",
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: { xs: '14px', md: '16px' },
    lineHeight: { xs: '21px', md: '24px' },
    py: { xs: 1.25, md: 1.5 },
    px: { xs: 2, md: 3 },
    borderRadius: '10px',
    color: '#676D79',
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    '&:hover': {
      backgroundColor: 'rgba(0, 74, 224, 0.06)',
      color: '#004AE0'
    },
    '&:active': {
      transform: 'scale(0.98)'
    }
  },
  activeButton: {
    backgroundColor: '#004AE0',
    color: '#FFFFFF',
    boxShadow: '0px 2px 8px rgba(0, 74, 224, 0.25)',
    '&:hover': {
      backgroundColor: '#0039B8',
      boxShadow: '0px 4px 12px rgba(0, 74, 224, 0.35)',
      transform: 'translateY(-1px)'
    },
    '&:active': {
      transform: 'translateY(0px) scale(0.98)'
    }
  }
};
