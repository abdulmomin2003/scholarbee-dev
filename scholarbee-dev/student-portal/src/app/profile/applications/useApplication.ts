import React, { useState } from 'react';
import { useApplicationStatus } from '../hooks/useProfile';
import { Application } from '../types';

const FILTER_OPTIONS = [
  { value: 'Approved', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Draft', label: 'Draft' }
];

type ApplicationHookReturn = {
  anchorEl: HTMLElement | null;
  handleFiltersMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  handleFiltersMenuClose: () => void;
  isFiltersOpen: boolean;
  selectedFilters: string[];
  handleRemoveFilter: (filterValue: string) => void;
  handleClearAll: () => void;
  handleFilterToggle: (filterValue: string) => void;
  getFilterLabel: (filterValue: string) => string;
  isLoading: boolean;
  error: unknown;
  filteredApplications: Application[];
  FILTER_OPTIONS: typeof FILTER_OPTIONS;
};

export const useApplication = (): ApplicationHookReturn => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Pass selected filters to useApplicationStatus
  const { applicationsData, isLoading, error } =
    useApplicationStatus(selectedFilters);

  const handleFiltersMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFiltersMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveFilter = (filterValue: string) => {
    setSelectedFilters((prev) => prev.filter((f) => f !== filterValue));
  };

  const handleClearAll = () => {
    setSelectedFilters([]);
  };

  const isFiltersOpen = Boolean(anchorEl);

  const handleFilterToggle = (filterValue: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterValue)
        ? prev.filter((f) => f !== filterValue)
        : [...prev, filterValue]
    );
  };

  const getFilterLabel = (filterValue: string) => {
    const option = FILTER_OPTIONS.find((opt) => opt.value === filterValue);
    return option ? option.label : filterValue;
  };

  return {
    anchorEl,
    handleFiltersMenuOpen,
    handleFiltersMenuClose,
    isFiltersOpen,
    selectedFilters,
    handleRemoveFilter,
    handleClearAll,
    handleFilterToggle,
    getFilterLabel,
    isLoading,
    error,
    filteredApplications: applicationsData?.data || [],
    FILTER_OPTIONS
  };
};
