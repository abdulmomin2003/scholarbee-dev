'use client';

import React, { useEffect, useState } from 'react';
import ProgramCarouselContent from './programCarouselContent';
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

interface ProgramCarouselContentClientProps {
  isScholarship?: boolean;
  initialPrograms?: ProgramsResponse | null;
  initialScholarships?: Scholarship[];
  styles: any;
}

export default function ProgramCarouselContentClient({
  isScholarship,
  initialPrograms,
  initialScholarships,
  styles
}: ProgramCarouselContentClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasInitialPrograms =
    initialPrograms?.docs != null && initialPrograms.docs.length > 0;

  if (!hasInitialPrograms && !mounted) {
    return null;
  }

  return (
    <ProgramCarouselContent
      isScholarship={isScholarship}
      initialPrograms={initialPrograms}
      initialScholarships={initialScholarships}
      styles={styles}
    />
  );
}
