'use client';
import React, { Suspense } from 'react';
import MemoizedProtectedFavoritePrograms from '../favorites';
import { FavoritesSkeleton } from '../pageComponents';

const FavoriteScholarshipsPage = () => {
  return (
    <Suspense fallback={<FavoritesSkeleton />}>
      <MemoizedProtectedFavoritePrograms type="scholarships" />
    </Suspense>
  );
};

export default FavoriteScholarshipsPage;
