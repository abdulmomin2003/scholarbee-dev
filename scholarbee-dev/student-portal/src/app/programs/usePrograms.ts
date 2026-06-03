import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useGetProgramsQuery,
  useGetRecommendationsQuery
} from '@/redux/api/programApi';
import { ProgramsFilters } from '@/types';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  useGetMajorsQuery,
  useGetDegreeLevelsQuery
} from '@/redux/api/majorApi';
import { getFormattedMajorsAndDegreeLevels } from '@/utils/helperFunctions';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import {
  ElasticsearchAdmissionProgramDocument,
  ElasticsearchAdmissionProgramsResponse
} from '@/types/admission-program.types';

interface QueryParams {
  page: number;
  search: string;
  university?: string;
  degree_level: string;
  courseForm: string;
  year?: string;
  intake?: string;
  min_fee?: number | null;
  max_fee?: number | null;
  major?: string;
  city?: string;
  receiving_applications?: boolean;
  admission_startdate_from?: string;
  admission_startdate_to?: string;
  admission_enddate_from?: string;
  admission_enddate_to?: string;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateWithOffset = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDate(date);
};

const getPrimitiveStatusFilters = (
  status?: string
): Pick<
  QueryParams,
  | 'receiving_applications'
  | 'admission_startdate_from'
  | 'admission_startdate_to'
  | 'admission_enddate_from'
  | 'admission_enddate_to'
> => {
  if (!status) return {};

  const today = getDateWithOffset(0);
  const yesterday = getDateWithOffset(-1);
  const tenDaysFromNow = getDateWithOffset(10);

  switch (status) {
    case 'open':
      return {
        receiving_applications: true,
        admission_enddate_from: today
      };
    case 'closed':
      return {
        admission_enddate_to: yesterday
      };
    case 'closingSoon':
      return {
        receiving_applications: true,
        admission_enddate_from: today,
        admission_enddate_to: tenDaysFromNow
      };
    case 'openingSoon':
      return {
        receiving_applications: false,
        admission_startdate_from: today
      };
    default:
      return {};
  }
};

const PROGRAMS_LISTING_LIMIT = 10;

export const usePrograms = (
  initialPrograms?: ElasticsearchAdmissionProgramDocument[],
  initialTotalDocs?: number,
  options?: { fixedMajor?: string; fixedCity?: string }
) => {
  const fixedMajor = options?.fixedMajor ?? '';
  const fixedCity = options?.fixedCity ?? '';
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialFilterValues = useMemo(() => {
    const getParam = (key: string) => searchParams.get(key) ?? '';

    const fee = getParam('fee');
    const [parsedMinFee, parsedMaxFee] = fee
      ? fee.split('-').map(Number)
      : [Number.NaN, Number.NaN];

    const min_fee = Number.isFinite(parsedMinFee) ? parsedMinFee : null;
    const max_fee = Number.isFinite(parsedMaxFee) ? parsedMaxFee : null;

    return {
      universityId: getParam('universityId'),
      university: getParam('university'),
      degree_level: getParam('degree_level'),
      major: fixedMajor || getParam('major'),
      courseForm: getParam('courseForm'),
      year: getParam('year'),
      intake: getParam('intake'),
      fee,
      min_fee,
      max_fee,
      city: fixedCity || getParam('city'),
      status: getParam('status'),
      search:
        getParam('search').trim().length >= 2 ? getParam('search').trim() : ''
    };
  }, [searchParams, fixedMajor, fixedCity]);

  const hasUrlDrivenFilters = useMemo(() => {
    return [
      'search',
      'universityId',
      'university',
      'degree_level',
      'major',
      'city',
      'courseForm',
      'year',
      'intake',
      'fee',
      'status',
      'min_fee',
      'max_fee'
    ].some((key) => Boolean(searchParams.get(key)));
  }, [searchParams]);

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [formData, setFormData] = useState<
    ProgramsFilters & {
      min_fee: number | null;
      max_fee: number | null;
    }
  >(() => ({
    university: initialFilterValues.university,
    universityId: initialFilterValues.universityId,
    degree_level: initialFilterValues.degree_level,
    major: initialFilterValues.major,
    courseFormat: '',
    fee: initialFilterValues.fee,
    min_fee: initialFilterValues.min_fee,
    max_fee: initialFilterValues.max_fee,
    age: '',
    startDate: '',
    year: initialFilterValues.year,
    intake: initialFilterValues.intake,
    courseForm: initialFilterValues.courseForm,
    city: initialFilterValues.city,
    status: initialFilterValues.status
  }));

  const [page, setPage] = useState<number>(1);
  const [allPrograms, setAllPrograms] = useState<
    ElasticsearchAdmissionProgramDocument[]
  >(() =>
    hasUrlDrivenFilters || fixedMajor || fixedCity ? [] : (initialPrograms ?? [])
  );
  const [searchValue, setSearchValue] = useState<string>(
    initialFilterValues.search
  );
  const debouncedSearchValue = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    const params = new URLSearchParams();

    if (formData.universityId)
      params.set('universityId', formData.universityId);
    if (formData.university) params.set('university', formData.university);
    if (formData.degree_level)
      params.set('degree_level', formData.degree_level);
    if (!fixedMajor && formData.major) params.set('major', formData.major);
    if (!fixedCity && formData.city) params.set('city', formData.city);
    if (formData.courseForm) params.set('courseForm', formData.courseForm);
    if (formData.year) params.set('year', formData.year);
    if (formData.intake) params.set('intake', formData.intake);
    if (formData.fee) params.set('fee', formData.fee);
    if (formData.status) params.set('status', formData.status);

    const trimmedSearch = debouncedSearchValue.trim();
    if (trimmedSearch.length >= 2) {
      params.set('search', trimmedSearch);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    globalThis.window.history.replaceState({}, '', newUrl);
  }, [formData, debouncedSearchValue, pathname, fixedMajor, fixedCity]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchValue(value);
      setPage(1);
    },
    []
  );

  const queryParams: QueryParams = useMemo(() => {
    const trimmedSearch = debouncedSearchValue.trim();
    const primitiveStatusFilters = getPrimitiveStatusFilters(formData.status);
    return {
      page,
      search: trimmedSearch.length >= 2 ? trimmedSearch : '',
      university: formData.universityId,
      degree_level: formData.degree_level,
      courseForm: formData.courseForm,
      year: formData.year,
      intake: formData.intake,
      min_fee: formData.min_fee,
      max_fee: formData.max_fee,
      major: fixedMajor || formData.major,
      city: fixedCity || formData.city,
      ...primitiveStatusFilters
    };
  }, [
    page,
    debouncedSearchValue,
    formData.degree_level,
    formData.courseForm,
    formData.universityId,
    formData.year,
    formData.intake,
    formData.min_fee,
    formData.max_fee,
    formData.major,
    formData.city,
    formData.status,
    fixedMajor,
    fixedCity
  ]);

  const hasActiveFilters = useMemo(() => {
    if (fixedMajor || fixedCity) return true;
    if (hasUrlDrivenFilters) return true;

    const trimmedSearch = debouncedSearchValue.trim();
    if (trimmedSearch.length >= 2) return true;

    return Boolean(
      formData.universityId ||
        formData.degree_level ||
        formData.courseForm ||
        formData.year ||
        formData.intake ||
        formData.fee ||
        formData.status ||
        formData.min_fee != null ||
        formData.max_fee != null ||
        formData.major ||
        formData.city
    );
  }, [
    fixedMajor,
    fixedCity,
    hasUrlDrivenFilters,
    debouncedSearchValue,
    formData.universityId,
    formData.degree_level,
    formData.courseForm,
    formData.year,
    formData.intake,
    formData.fee,
    formData.status,
    formData.min_fee,
    formData.max_fee,
    formData.major,
    formData.city
  ]);

  const shouldUseRecommendations = !hasActiveFilters;

  const {
    data: recommendations,
    isLoading: recsLoading,
    isFetching: recsFetching
  } = useGetRecommendationsQuery(
    { type: 'programs', page, limit: PROGRAMS_LISTING_LIMIT },
    { skip: !shouldUseRecommendations }
  );

  const {
    data: programs,
    isLoading,
    isFetching
  } = useGetProgramsQuery(queryParams, { skip: shouldUseRecommendations });

  const activePrograms = shouldUseRecommendations ? recommendations : programs;
  const activeLoading = shouldUseRecommendations ? recsLoading : isLoading;
  const activeFetching = shouldUseRecommendations ? recsFetching : isFetching;

  useEffect(() => {
    const typedProgramsResponse =
      activePrograms as ElasticsearchAdmissionProgramsResponse;

    if (typedProgramsResponse?.docs && !activeFetching) {
      setAllPrograms((prevPrograms) => {
        if (page === 1) {
          return typedProgramsResponse.docs;
        }

        if (typedProgramsResponse.docs.length === 0) {
          return prevPrograms;
        }

        const existingIds = new Set(prevPrograms.map((p) => p._id));
        const newPrograms = typedProgramsResponse.docs.filter(
          (program) => !existingIds.has(program._id)
        );

        if (newPrograms.length === 0) {
          return prevPrograms;
        }

        return prevPrograms.concat(newPrograms);
      });
    }
  }, [activePrograms, page, activeFetching]);

  const handleChange = useCallback(
    (name: string, value: string) => {
      if (fixedMajor && name === 'major') return;
      if (fixedCity && name === 'city') return;
      setPage(1);
      if (name === 'fee') {
        const [min, max] = value.split('-').map(Number);
        setFormData((prev) => ({
          ...prev,
          fee: value,
          min_fee: min || null,
          max_fee: max || null
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    [fixedMajor, fixedCity]
  );

  const handleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  const handleUniversityChange = useCallback((name: string, value: string) => {
    setPage(1);
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const {
    data: majorsPrograms,
    isLoading: isLoadingMajors,
    isFetching: isFetchingMajors
  } = useGetMajorsQuery({
    university_id: formData?.universityId
  });

  const {
    data: degreeLevelsPrograms,
    isLoading: isLoadingDegreeLevels,
    isFetching: isFetchingDegreeLevels
  } = useGetDegreeLevelsQuery({
    university_id: formData?.universityId
  });

  useEffect(() => {
    if (
      formData.universityId &&
      formData.degree_level &&
      degreeLevelsPrograms
    ) {
      const currentStudyLevelExists = degreeLevelsPrograms.includes(
        formData.degree_level
      );

      if (!currentStudyLevelExists) {
        setFormData((prev) => ({
          ...prev,
          degree_level: ''
        }));
      }
    }
  }, [formData.universityId, formData.degree_level, degreeLevelsPrograms]);

  useEffect(() => {
    if (formData.universityId && formData.major && majorsPrograms) {
      const currentMajorExists = majorsPrograms.includes(formData.major);

      if (!currentMajorExists) {
        setFormData((prev) => ({
          ...prev,
          major: ''
        }));
      }
    }
  }, [formData.universityId, majorsPrograms, formData.major]);

  const handleReset = useCallback(() => {
    setFormData({
      university: '',
      universityId: '',
      degree_level: '',
      major: fixedMajor,
      courseFormat: '',
      fee: '',
      min_fee: null,
      max_fee: null,
      age: '',
      startDate: '',
      year: '',
      intake: '',
      courseForm: '',
      city: fixedCity,
      status: ''
    });
    setSearchValue('');
    setPage(1);
  }, [fixedMajor, fixedCity]);

  return {
    showFilters,
    formData,
    allPrograms,
    isLoading: activeLoading,
    isFetching: activeFetching,
    programs: activePrograms,
    handleChange,
    handleFilters,
    handleLoadMore,
    totalDocs: activePrograms?.pagination?.totalDocs ?? initialTotalDocs,
    handleSearchChange,
    handleUniversityChange,
    handleReset,
    searchValue,
    isLoadingMajors: isLoadingMajors || isFetchingMajors,
    isLoadingDegreeLevels: isLoadingDegreeLevels || isFetchingDegreeLevels,
    majorsPrograms: getFormattedMajorsAndDegreeLevels(majorsPrograms),
    degreeLevelsPrograms:
      getFormattedMajorsAndDegreeLevels(degreeLevelsPrograms),
    fixedMajor: fixedMajor || undefined
  };
};
