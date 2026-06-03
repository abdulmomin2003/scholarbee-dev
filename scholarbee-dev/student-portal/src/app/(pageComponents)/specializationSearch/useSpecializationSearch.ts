'use client';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { useGetSpecializationsQuery } from '@/redux/api/specializationApi';

interface UseSpecializationSearchProps {
  onChange: (name: string, value: string) => void;
  name: string;
  defaultValue?: {
    id: string;
    name: string;
  };
}

export const useSpecializationSearch = ({
  onChange,
  name,
  defaultValue
}: UseSpecializationSearchProps) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<{
    id: string;
    name: string;
  } | null>(defaultValue || null);

  const { data, isFetching } = useGetSpecializationsQuery({
    search: searchTerm,
    page,
    limit: 20
  });

  const specializations = useMemo(
    () =>
      data?.docs.map((spec) => ({
        id: spec.id,
        name: spec.name
      })) || [],
    [data?.docs]
  );

  // Memoize the debounced function
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setPage(1);
      }, 300),
    []
  );

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      debouncedSearch(newInputValue);
    },
    [debouncedSearch]
  );

  const handleSelectChange = useCallback(
    (value: { id: string; name: string } | null) => {
      setSelectedSpecialization(value);
      if (value) {
        onChange(name, value.name);
      } else {
        onChange(name, '');
      }
    },
    [onChange, name]
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLUListElement>) => {
      const list = event.currentTarget;
      if (
        list.scrollTop + list.clientHeight >= list.scrollHeight - 20 &&
        !isFetching &&
        data?.hasNextPage
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [isFetching, data?.hasNextPage]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (defaultValue) {
      setSelectedSpecialization(defaultValue);
    }
  }, [defaultValue]);

  return {
    specializations,
    selectedSpecialization,
    searchTerm,
    isFetching,
    handleInputChange,
    handleSelectChange,
    handleScroll
  };
};
