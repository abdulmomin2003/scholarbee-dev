import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import debounce from 'lodash/debounce';
import { useGetUniversitiesQuery } from '@/redux/api/universitiesApi';

interface University {
  _id: string;
  id?: string;
  name: string;
}

interface RawUniversity {
  _id?: string;
  id?: string;
  name?: string;
  university_name?: string;
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
  const isSelectingRef = useRef(false);

  const getReturnedUniversities = useCallback(
    (payload: unknown): University[] => {
      const typedPayload = payload as {
        data?:
          | RawUniversity[]
          | { data?: RawUniversity[]; docs?: RawUniversity[] };
        docs?: RawUniversity[];
      };

      const dataLayer = typedPayload?.data;
      const returnedItems = Array.isArray(dataLayer)
        ? dataLayer
        : Array.isArray(typedPayload?.docs)
          ? typedPayload.docs
          : Array.isArray(dataLayer?.docs)
            ? dataLayer.docs
            : Array.isArray(dataLayer?.data)
              ? dataLayer.data
              : [];

      // Keep backend order and records as-is; only shape them for Autocomplete.
      return returnedItems.map((uni, index) => ({
        _id: uni?._id || uni?.id || `uni-${page}-${index}`,
        name: uni?.name || uni?.university_name || ''
      }));
    },
    [page]
  );

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
      const returnedUniversities = getReturnedUniversities(data);
      setUniversities((prevUniversities) => {
        if (page === 1) {
          return returnedUniversities;
        }
        return [...prevUniversities, ...returnedUniversities];
      });
    }
  }, [data, getReturnedUniversities, page]);

  useEffect(() => {
    // Handle both { id, name } and { _id, name } formats
    const id = defaultValue?._id || (defaultValue as { id?: string })?.id || '';
    if (defaultValue && defaultValue.name && id) {
      const universityValue = {
        _id: id,
        name: defaultValue.name
      };
      setSelectedUniversity((prevSelectedUniversity) => {
        if (prevSelectedUniversity?._id !== id) {
          return universityValue;
        }
        return prevSelectedUniversity;
      });
      setInputValue(defaultValue.name);
    } else {
      // Clear internal state when defaultValue is undefined/null
      setSelectedUniversity(null);
      setInputValue('');
      setSearchTerm('');
      setPage(1);
    }
  }, [defaultValue]);

  // Keep inputValue in sync with selectedUniversity to ensure correct display
  useEffect(() => {
    if (selectedUniversity?.name) {
      // Always update inputValue when selectedUniversity changes, even during selection
      // This ensures the display is correct immediately
      setInputValue(selectedUniversity.name);
    }
    // Note: We don't clear inputValue when selectedUniversity is null
    // because the user might be typing to search for a university
  }, [selectedUniversity]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setPage(1);
        if (refetch) {
          refetch();
        }
      }, 500),
    [refetch]
  );

  const handleInputChange = useCallback(
    (newInputValue: string, reason?: string) => {
      // Ignore input changes that occur during selection to prevent overwriting the selected value
      if (isSelectingRef.current) {
        return;
      }
      // Ignore input changes that are triggered by reset
      if (reason === 'reset') {
        return;
      }
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
      // Set flag to prevent inputChange from interfering
      isSelectingRef.current = true;

      setSelectedUniversity(value);

      if (value) {
        // Set inputValue immediately to ensure it displays correctly
        setInputValue(value.name || '');

        if (onCampusChange) {
          onCampusChange(value.name, value._id);
        } else if (onChange) {
          onChange(name, value.name);
          onChange('universityId', value._id);
        }
      } else {
        setInputValue('');
        if (onCampusChange) {
          onCampusChange('', '');
        } else if (onChange) {
          onChange(name, '');
          onChange('universityId', '');
        }
        setSearchTerm('');
        setPage(1);
        if (refetch) {
          refetch();
        }
      }
      // Reset flag after a short delay to allow Autocomplete to update
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 100);
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

        if (!isFetching && hasNextPage) {
          setPage((prev) => prev + 1);
        }
      }
    },
    [isFetching, data?.meta?.page, data?.meta?.pages]
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
