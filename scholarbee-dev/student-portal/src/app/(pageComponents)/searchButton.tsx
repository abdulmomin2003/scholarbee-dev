'use client';
import { Button } from '@mui/material';
import Link from 'next/link';
import React from 'react';

interface SearchButtonProps {
  filtersForm: {
    universityId: string;
    university: string;
    degree_level: string;
    search: string;
  };
}

function buildProgramsHref(
  filtersForm: SearchButtonProps['filtersForm']
): string {
  const validFilters = Object.entries(filtersForm).reduce(
    (acc, [key, value]) => {
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      if (trimmedValue) acc[key] = trimmedValue;
      return acc;
    },
    {} as Record<string, string>
  );

  if (Object.keys(validFilters).length === 0) {
    return '/programs';
  }

  const queryParams = Object.entries(validFilters)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `/programs?${queryParams}`;
}

const SearchButton = ({ filtersForm }: SearchButtonProps) => {
  const href = buildProgramsHref(filtersForm);

  return (
    <Link
      href={href}
      style={{ maxWidth: 432, width: '100%', textDecoration: 'none' }}
      aria-label="Search programs"
    >
      <Button
        component="span"
        sx={{
          maxWidth: 432,
          width: '100%'
        }}
        variant="contained"
      >
        Search
      </Button>
    </Link>
  );
};

export default SearchButton;
