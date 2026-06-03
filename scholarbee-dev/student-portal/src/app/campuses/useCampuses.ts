import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGetCampusesQuery } from '@/redux/api/campusesApi';
import { useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import { Campus, QueryCampusParams } from '@/types/campus.types';

interface CampusFilters {
  name?: string;
  city?: string;
  area?: string;
  university_type?: string;
}

export const useCampuses = () => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [formData, setFormData] = useState<CampusFilters>({
    name: '',
    city: '',
    area: '',
    university_type: ''
  });

  const [page, setPage] = useState<number>(1);
  const [allCampuses, setAllCampuses] = useState<Campus[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedSearchValue = useDebouncedValue(searchValue, 300);
  const isInitialMount = useRef(true);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize filters and search from URL params ONLY on mount
  useEffect(() => {
    if (isInitialMount.current) {
      const name = searchParams.get('name') ?? '';
      const city = searchParams.get('city') ?? '';
      const area = searchParams.get('area') ?? '';
      const university_type = searchParams.get('university_type') ?? '';

      setFormData((prev) => ({
        ...prev,
        name: name ? decodeURIComponent(name) : '',
        city: city ? decodeURIComponent(city) : '',
        area: area ? decodeURIComponent(area) : '',
        university_type: university_type
          ? decodeURIComponent(university_type)
          : ''
      }));

      const rawName = name ? decodeURIComponent(name).trim() : '';
      const decodedSearch = rawName.length >= 2 ? rawName : '';
      setSearchValue(decodedSearch);

      isInitialMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL params when filters or debounced search change
  // Mirror programs page behavior: search is driven solely by debouncedSearchValue
  useEffect(() => {
    const params = new URLSearchParams();

    const trimmedSearch = debouncedSearchValue.trim();
    if (trimmedSearch.length >= 2) {
      params.set('name', trimmedSearch);
    }
    if (formData.city && formData.city.trim()) {
      params.set('city', formData.city.trim());
    }
    if (formData.area && formData.area.trim()) {
      params.set('area', formData.area.trim());
    }
    if (formData.university_type && formData.university_type.trim()) {
      params.set('university_type', formData.university_type.trim());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    window.history.replaceState({}, '', newUrl);
  }, [
    formData.city,
    formData.area,
    formData.university_type,
    debouncedSearchValue,
    pathname
  ]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchValue(value);
      setPage(1);
    },
    []
  );

  // Create a stable query params object with consistent structure
  const queryParams: QueryCampusParams = useMemo(() => {
    const params: QueryCampusParams = {
      page,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    // Use debouncedSearchValue as the single source of truth for name search
    const trimmedSearch = debouncedSearchValue.trim();
    if (trimmedSearch.length >= 2) {
      params.name = trimmedSearch;
    }
    if (formData.city && formData.city.trim()) {
      params.city = formData.city.trim();
    }
    if (formData.area && formData.area.trim()) {
      params.area = formData.area.trim();
    }
    if (formData.university_type && formData.university_type.trim()) {
      params.university_type = formData.university_type.trim();
    }

    return params;
  }, [
    page,
    debouncedSearchValue,
    formData.city,
    formData.area,
    formData.university_type
  ]);

  const {
    data: campusesResponse,
    isLoading,
    isFetching
  } = useGetCampusesQuery(queryParams);

  useEffect(() => {
    if (campusesResponse?.data && !isFetching) {
      setAllCampuses((prevCampuses) => {
        if (page === 1) {
          return campusesResponse.data;
        }

        // Early return if no new campuses to process
        if (campusesResponse.data.length === 0) {
          return prevCampuses;
        }

        // Create Set only once and reuse for filtering
        const existingIds = new Set(prevCampuses.map((c) => c._id));
        const newCampuses = campusesResponse.data.filter(
          (campus) => !existingIds.has(campus._id)
        );

        // Early return if no new unique campuses - prevents unnecessary re-renders
        if (newCampuses.length === 0) {
          return prevCampuses;
        }

        // Direct concatenation is more efficient than spread for large arrays
        return prevCampuses.concat(newCampuses);
      });
    }
  }, [campusesResponse, page, isFetching]);

  const handleChange = useCallback((name: string, value: string) => {
    setPage(1);
    const newValue = value && value.trim() ? value.trim() : '';
    setFormData((prev) => ({ ...prev, [name]: newValue || undefined }));
  }, []);

  const handleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  return {
    showFilters,
    formData,
    allCampuses,
    isLoading,
    isFetching,
    campusesResponse,
    handleChange,
    handleFilters,
    handleLoadMore,
    totalDocs: campusesResponse?.meta?.total || 0,
    handleSearchChange,
    searchValue,
    hasNextPage:
      campusesResponse?.meta &&
      campusesResponse.meta.page < campusesResponse.meta.pages
  };
};
