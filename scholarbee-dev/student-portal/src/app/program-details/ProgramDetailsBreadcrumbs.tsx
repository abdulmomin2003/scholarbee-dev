'use client';

import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';

export type ProgramDetailsBreadcrumbConfig = {
  programTitle: string;
  universityTitle?: string;
  city?: string;
  campusSlug?: string;
};

export default function ProgramDetailsBreadcrumbs({
  programTitle,
  universityTitle,
  city,
  campusSlug
}: ProgramDetailsBreadcrumbConfig) {
  const [navSource, setNavSource] = useState<string | null>(null);

  useEffect(() => {
    setNavSource(sessionStorage.getItem('programNavigationSource'));
  }, []);

  const handleUniversityClick = () => {
    sessionStorage.setItem('returnToProgramsTable', 'true');
  };

  const items =
    navSource === 'universities'
      ? [
          { title: 'Universities', link: '/universities' },
          ...(universityTitle && city && campusSlug
            ? [
                {
                  title: universityTitle,
                  link: `/universities/${city.toLowerCase()}/${campusSlug.toLowerCase()}`,
                  onClick: handleUniversityClick
                }
              ]
            : []),
          { title: programTitle }
        ]
      : [{ title: 'Programs', link: '/programs' }, { title: programTitle }];

  return (
    <Container sx={{ py: 2 }}>
      <CustomizedBreadcrumbs items={items} />
    </Container>
  );
}
