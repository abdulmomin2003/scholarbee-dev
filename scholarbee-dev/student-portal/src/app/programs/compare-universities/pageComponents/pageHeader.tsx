import React, { Suspense } from 'react';
import { Box, Container, Typography } from '@mui/material';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import Title from '@/components/atoms/title';
import { useSearchParams } from 'next/navigation';

const PageHeaderContent: React.FC = () => {
  const searchParams = useSearchParams();
  const fromHome = searchParams?.get('from') === 'home';

  const items = fromHome
    ? [{ title: 'Compare Universities' }]
    : [
        { title: 'Programs', link: '/programs' },
        { title: 'Compare Universities' }
      ];

  return (
    <Box bgcolor="white">
      <Container>
        <CustomizedBreadcrumbs items={items} />
        <Box mt={5} pb={3}>
          <Title title="Compare Universities" />
          <Typography variant="body2" fontSize={20}>
            Compare any two Universities of your choice.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const PageHeader: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <PageHeaderContent />
    </Suspense>
  );
};

export default PageHeader;
