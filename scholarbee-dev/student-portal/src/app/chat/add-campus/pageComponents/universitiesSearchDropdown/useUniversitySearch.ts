import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useGetUniversitiesQuery } from '@/redux/api/universitiesApi';

interface University {
  _id: string;
  id?: string;
  name: string;
}

interface UseUniversitySearchProps {
  onChange?: (name: string, value: string) => void;
  name: string;
  defaultValue?: { name: string; _id: string };
  url?: string;
  onCampusChange?: (name: string, value: string) => void;
}

export const useUniversitySearch = ({
  onChange,
  name,
  defaultValue,
  url,
  onCampusChange
}: UseUniversitySearchProps) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [inputValue, setInputValue] = useState('');

  const { data, isFetching, refetch } = useGetUniversitiesQuery(
    {
      page,
      // limit: 100,
      search: searchTerm || undefined,
      url
    },
    { skip: false }
  );

  useEffect(() => {
    if (data) {
      setUniversities((prevUniversities) => {
        // const newUniversities = data.data
        const newUniversities = data?.data
          .filter(
            (newUni) =>
              !prevUniversities.some(
                (existingUni) => existingUni._id === newUni._id
              )
          )
          .map((uni) => ({
            _id: uni._id,
            name: uni.name
          }));
        const unis = [...prevUniversities, ...newUniversities];

        const exists = unis.some((uni) => uni?._id === defaultValue?._id);
        if (exists) {
          return unis;
        } else {
          return defaultValue && defaultValue._id && defaultValue.name
            ? [defaultValue, ...unis]
            : unis;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (defaultValue && defaultValue.name && defaultValue._id) {
      setSelectedUniversity((prevSelectedUniversity) => {
        if (prevSelectedUniversity?._id !== defaultValue._id) {
          return defaultValue;
        }
        return prevSelectedUniversity;
      });
    } else if (onCampusChange) {
      setSelectedUniversity(null);
    }
  }, [defaultValue, onChange, onCampusChange]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setPage(1);
        refetch();
      }, 500),
    [refetch]
  );

  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);
      if (newInputValue === '') {
        setSelectedUniversity(null);
        if (onCampusChange) {
          onCampusChange(name, '');
        } else if (onChange) {
          onChange(name, '');
        }
      } else if (newInputValue !== selectedUniversity?.name) {
        debouncedSearch(newInputValue);
      }
    },
    [debouncedSearch, selectedUniversity, onChange, onCampusChange, name]
  );

  const handleSelectChange = useCallback(
    (value: University | null) => {
      setSelectedUniversity(value);

      if (value) {
        if (onCampusChange) {
          onCampusChange(value.name, value._id);
        } else if (onChange) {
          onChange(name, value.name);
          onChange('universityId', value._id);
        }
        setInputValue(value.name);
      } else {
        if (onCampusChange) {
          onCampusChange('', '');
        } else if (onChange) {
          onChange(name, '');
          onChange('universityId', '');
        }
        setInputValue('');
        setSearchTerm('');
        setPage(1);
        refetch();
      }
    },
    [onChange, onCampusChange, name, refetch]
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLUListElement>) => {
      const listBoxNode = event.currentTarget;
      if (
        listBoxNode.scrollTop + listBoxNode.clientHeight >=
        listBoxNode.scrollHeight - 200
      ) {
        // Check if there are more pages available using the correct API structure
        const currentPage = data?.meta?.page || 1;
        const totalPages = data?.meta?.pages || 1;
        const hasNextPage = currentPage < totalPages;

        console.log('University Scroll Debug:', {
          currentPage,
          totalPages,
          hasNextPage,
          isFetching,
          universitiesCount: universities.length
        });

        if (!isFetching && hasNextPage) {
          setPage((prev) => prev + 1);
        }
      }
    },
    [isFetching, data?.meta?.page, data?.meta?.pages, universities.length]
  );

  return {
    universities,
    selectedUniversity,
    inputValue,
    isFetching,
    handleInputChange,
    handleSelectChange,
    handleScroll
  };
};
