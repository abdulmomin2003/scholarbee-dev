import {
  useAddScholarshipToFavoriteMutation,
  useRemoveScholarshipFromFavoriteMutation,
  useGetScholarshipsQuery
} from '@/redux/api/scholarshipApi';
import theme from '@/utils/theme';
import { useMediaQuery } from '@mui/material';
import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import type { Scholarship } from '@/types/scholarship';

export interface UseScholarshipsInitialData {
  initialScholarships: Scholarship[];
  initialMeta: { total: number; page: number; totalPages: number };
}

export const useScholarships = (
  initialData?: UseScholarshipsInitialData | null
) => {
  const [page, setPage] = useState<number>(1);
  const [formData, setFormData] = useState<{
    search: string;
    campusId: string;
    campus: string;
    degree_level: string;
    scholarship_type: string;
    location: string;
    status: string;
    rating: string;
    amountMin: number | null;
    amountMax: number | null;
    amount: string;
    deadline_status: string;
  }>({
    campus: '',
    search: '',
    campusId: '',
    degree_level: '',
    scholarship_type: '',
    location: '',
    status: '',
    rating: '',
    amountMin: null,
    amountMax: null,
    amount: '',
    deadline_status: ''
  });
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>(
    initialData?.initialScholarships ?? []
  );
  const [searchValue, setSearchValue] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [mediaQueryMounted, setMediaQueryMounted] = useState(false);
  const isSmallScreenQuery = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true
  });
  useEffect(() => setMediaQueryMounted(true), []);
  // Use false until mounted so server and client first paint match (avoids hydration mismatch)
  const isSmallScreen = mediaQueryMounted ? isSmallScreenQuery : false;
  const isInitialMount = useRef(true);
  const skippedInitialFetch = useRef(false);
  const hasInitialData = initialData?.initialScholarships != null;
  const skipFirstFetch =
    hasInitialData && page === 1 && !skippedInitialFetch.current;
  if (skipFirstFetch) skippedInitialFetch.current = true;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const debouncedSearchValue = useDebouncedValue(searchValue, 300); // 300ms debounce

  const [addScholarshipToFavoriteMutation, { isLoading: isAddingToFavorite }] =
    useAddScholarshipToFavoriteMutation();
  const [
    removeScholarshipFromFavoriteMutation,
    { isLoading: isRemovingFromFavorite }
  ] = useRemoveScholarshipFromFavoriteMutation();

  // Initialize filters from URL params ONLY on mount
  useEffect(() => {
    if (isInitialMount.current) {
      const campusId = searchParams.get('campusId') ?? '';
      const campus = searchParams.get('campus') ?? '';
      const degree_level = searchParams.get('degree_level') ?? '';
      const scholarship_type = searchParams.get('scholarship_type') ?? '';
      const location = searchParams.get('location') ?? '';
      const amount = searchParams.get('amount') ?? '';
      const deadline_status = searchParams.get('deadline_status') ?? '';
      const search = searchParams.get('search') ?? '';

      setFormData((prevFormData) => ({
        ...prevFormData,
        campusId,
        campus: decodeURIComponent(campus),
        degree_level: decodeURIComponent(degree_level),
        scholarship_type: decodeURIComponent(scholarship_type),
        location: decodeURIComponent(location),
        amount: decodeURIComponent(amount),
        deadline_status: decodeURIComponent(deadline_status)
      }));

      const rawSearch = search ? decodeURIComponent(search).trim() : '';
      setSearchValue(rawSearch.length >= 2 ? rawSearch : '');

      // Handle amount parsing
      if (amount) {
        const [min, max] = amount.split('-').map(Number);
        setFormData((prev) => ({
          ...prev,
          amount,
          amountMin: min || null,
          amountMax: max || null
        }));
      }

      isInitialMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL with current filters whenever they change
  useEffect(() => {
    const params = new URLSearchParams();

    if (formData.campusId) params.set('campusId', formData.campusId);
    if (formData.campus)
      params.set('campus', encodeURIComponent(formData.campus));
    if (formData.degree_level)
      params.set('degree_level', encodeURIComponent(formData.degree_level));
    if (formData.scholarship_type)
      params.set(
        'scholarship_type',
        encodeURIComponent(formData.scholarship_type)
      );
    if (formData.location)
      params.set('location', encodeURIComponent(formData.location));
    if (formData.amount)
      params.set('amount', encodeURIComponent(formData.amount));
    if (formData.deadline_status)
      params.set(
        'deadline_status',
        encodeURIComponent(formData.deadline_status)
      );
    const trimmedSearch = debouncedSearchValue.trim();
    if (trimmedSearch.length >= 2) {
      params.set('search', encodeURIComponent(trimmedSearch));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Update URL without triggering navigation
    window.history.replaceState({}, '', newUrl);
  }, [formData, debouncedSearchValue, pathname]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { amount, ...queryParams } = formData;

  const {
    data: scholarships,
    isLoading,
    isFetching
  } = useGetScholarshipsQuery(
    {
      page,
      ...queryParams,
      search: debouncedSearchValue.trim().length >= 2 ? debouncedSearchValue.trim() : ''
    },
    { skip: skipFirstFetch }
  );

  const userId = Cookies.get('userId');

  useEffect(() => {
    if (scholarships?.data) {
      setAllScholarships((prevScholarships) => {
        if (page === 1) {
          return scholarships.data;
        }

        // Early return if no new scholarships to process
        if (scholarships.data.length === 0) {
          return prevScholarships;
        }

        // Create Set only once and reuse for filtering
        const existingIds = new Set(prevScholarships.map((s) => s._id));
        const newScholarships = scholarships.data.filter(
          (s: { _id: string }) => !existingIds.has(s._id)
        );

        // Early return if no new unique scholarships - prevents unnecessary re-renders
        if (newScholarships.length === 0) {
          return prevScholarships;
        }

        // Direct concatenation is more efficient than spread for large arrays
        return prevScholarships.concat(newScholarships);
      });
    }
  }, [scholarships, page]);

  // Optimistic UI update functions
  const addScholarshipToFavorite = useCallback(
    async (scholarshipId: string) => {
      if (!userId || !scholarshipId) return;

      // Optimistically update UI
      setAllScholarships((prevScholarships) =>
        prevScholarships.map((scholarship) =>
          scholarship._id === scholarshipId
            ? {
                ...scholarship,
                favouriteBy: scholarship.favouriteBy
                  ? [...scholarship.favouriteBy, userId]
                  : [userId]
              }
            : scholarship
        )
      );

      try {
        // Make the API call
        await addScholarshipToFavoriteMutation(scholarshipId).unwrap();
      } catch (error) {
        // Revert the optimistic update on error
        setAllScholarships((prevScholarships) =>
          prevScholarships.map((scholarship) =>
            scholarship._id === scholarshipId
              ? {
                  ...scholarship,
                  favouriteBy: scholarship.favouriteBy?.filter(
                    (id: string) => id !== userId
                  )
                }
              : scholarship
          )
        );
        console.error('Failed to add scholarship to favorites:', error);
        // You could also show an error toast/notification here
      }
    },
    [userId, addScholarshipToFavoriteMutation]
  );

  const removeScholarshipFromFavorite = useCallback(
    async (scholarshipId: string) => {
      if (!userId || !scholarshipId) return;

      // Optimistically update UI
      setAllScholarships((prevScholarships) =>
        prevScholarships.map((scholarship) =>
          scholarship._id === scholarshipId
            ? {
                ...scholarship,
                favouriteBy: scholarship.favouriteBy?.filter(
                  (id: string) => id !== userId
                )
              }
            : scholarship
        )
      );

      try {
        // Make the API call
        await removeScholarshipFromFavoriteMutation(scholarshipId).unwrap();
      } catch (error) {
        // Revert the optimistic update on error
        setAllScholarships((prevScholarships) =>
          prevScholarships.map((scholarship) =>
            scholarship._id === scholarshipId
              ? {
                  ...scholarship,
                  favouriteBy: scholarship.favouriteBy
                    ? [...scholarship.favouriteBy, userId]
                    : [userId]
                }
              : scholarship
          )
        );
        console.error('Failed to remove scholarship from favorites:', error);
        // You could also show an error toast/notification here
      }
    },
    [userId, removeScholarshipFromFavoriteMutation]
  );

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchValue(value);
      setPage(1);
    },
    []
  );

  const toggleFiltersShow = () => {
    setShowFilters((prev) => !prev);
  };

  const handleChange = (name: string, value: string) => {
    setPage(1);
    if (name === 'amount') {
      const [min, max] = value.split('-').map(Number);
      setFormData((prev) => ({
        ...prev,
        amount: value,
        amountMin: min || null,
        amountMax: max || null
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const totalDocs = skipFirstFetch
    ? initialData?.initialMeta?.total
    : scholarships?.meta?.total;
  const hasNextPage = skipFirstFetch
    ? (initialData?.initialMeta?.totalPages ?? 0) > 1
    : (scholarships?.meta?.totalPages ?? 0) > (scholarships?.meta?.page ?? 0);

  return {
    allScholarships,
    isLoading: skipFirstFetch ? false : isLoading,
    isFetching: skipFirstFetch ? false : isFetching,
    scholarships,
    handleLoadMore,
    hasNextPage,
    totalDocs,
    handleSearchChange,
    toggleFiltersShow,
    handleChange,
    formData,
    showFilters,
    isSmallScreen,
    userId,
    addScholarshipToFavorite,
    isAddingToFavorite,
    removeScholarshipFromFavorite,
    isRemovingFromFavorite,
    searchValue
  };
};
