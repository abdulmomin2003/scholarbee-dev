'use client';

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import ProgramCarouselContentClient from './ProgramCarouselContentClient';

import { ElasticsearchAdmissionProgramDocument } from '@/types/admission-program.types';
import { Scholarship } from '@/types/scholarship';

interface ProgramsResponse {
  docs: ElasticsearchAdmissionProgramDocument[];
  pagination?: {
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

interface ProgramSectionWrapperProps {
  /** SSR programs grid — rendered into initial HTML for SEO */
  children: React.ReactNode;
  /** SSR scholarships grid — also in initial HTML for SEO */
  scholarshipsGrid?: React.ReactNode;
  initialPrograms: ProgramsResponse | null | undefined;
  initialScholarships?: Scholarship[];
  isScholarship?: boolean;
  styles: Record<string, unknown>;
}

export default function ProgramSectionWrapper({
  children,
  scholarshipsGrid,
  initialPrograms,
  initialScholarships,
  isScholarship,
  styles
}: ProgramSectionWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Box
        component="div"
        sx={{ display: mounted ? 'none' : 'block' }}
        aria-hidden={mounted}
      >
        {children}
        {scholarshipsGrid}
      </Box>
      {mounted && (
        <ProgramCarouselContentClient
          isScholarship={isScholarship}
          initialPrograms={initialPrograms}
          initialScholarships={initialScholarships}
          styles={styles}
        />
      )}
    </>
  );
}
