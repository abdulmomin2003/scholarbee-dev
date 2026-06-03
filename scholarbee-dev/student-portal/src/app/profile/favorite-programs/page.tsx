'use client';
import React, { Suspense } from 'react';
import MemoizedProtectedFavoritePrograms from '../favorites';
import { FavoritesSkeleton } from '../pageComponents';

const FavoriteProgramsPage = () => {
  return (
    <Suspense fallback={<FavoritesSkeleton />}>
      <MemoizedProtectedFavoritePrograms type="programs" />
    </Suspense>
  );
};

export default FavoriteProgramsPage;
