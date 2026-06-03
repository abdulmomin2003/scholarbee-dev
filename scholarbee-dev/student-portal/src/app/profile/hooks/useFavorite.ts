/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetFavoriteProgramsQuery } from '@/redux/api/programApi';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { useGetFavoriteScholarshipsQuery } from '@/redux/api/scholarshipApi';

export const useFavorites = (type?: string) => {
  const [page, setPage] = useState<number>(1);
  const [scholarshipPage, setScholarshipPage] = useState<number>(1);

  const userId = Cookies.get('userId');

  const {
    data: favorites,
    isLoading: isLoadingFavoritePrograms,
    isFetching: isFetchingFavoritePrograms
  } = useGetFavoriteProgramsQuery(
    { page },
    {
      skip:
        !userId || (type !== undefined && type !== '' && type !== 'programs'),
      refetchOnMountOrArgChange: true
    }
  );

  const {
    data: favoritesScholarships,
    isLoading: isLoadingScholarships,
    isFetching: isFetchingScholarships
  } = useGetFavoriteScholarshipsQuery(
    { page: scholarshipPage },
    {
      skip:
        !userId ||
        (type !== undefined && type !== '' && type !== 'scholarships'),
      refetchOnMountOrArgChange: true
    }
  );

  const handleLoadMoreScholarships = () => {
    setScholarshipPage((prevPage) => prevPage + 1);
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return {
    allFavorites: favorites?.data ?? [],
    isLoadingFavoritePrograms,
    isFetchingFavoritePrograms,
    handleLoadMore,
    totalDocs: favorites?.meta.total,
    totalProgramPages: favorites?.meta?.pages,
    programPage: page,
    favoritesScholarships: favoritesScholarships?.data ?? [],
    totalFavoritesScholarships: favoritesScholarships?.meta?.total,
    totalScholarshipPages: favoritesScholarships?.meta?.totalPages,
    scholarshipPage,
    isLoadingScholarships,
    isFetchingScholarships,
    handleLoadMoreScholarships,
    meta: favorites?.meta,
    metaScholarships: favoritesScholarships?.meta
  };
};
