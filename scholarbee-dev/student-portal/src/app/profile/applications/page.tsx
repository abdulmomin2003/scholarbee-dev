'use client';
import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Stack,
  Chip,
  Button,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styles } from '../styles';
import ErrorMessage from '../pageComponents/errorMessage';
import ApplicationsList from '../pageComponents/applicatoinList';
import { ApplicationsListSkeleton } from '../pageComponents';
import { COLORS } from '@/constants/colors';
import Image from 'next/image';
import { useApplication } from './useApplication';
import Title from '@/components/atoms/title';

const ApplicationsPage = () => {
  const {
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
    filteredApplications,
    FILTER_OPTIONS
  } = useApplication();

  if (error) {
    return (
      <ErrorMessage
        message={
          error instanceof Error
            ? error?.message
            : 'Failed to load applications'
        }
      />
    );
  }

  // if (isLoading) {
  //   return <ApplicationsListSkeleton />;
  // }

  return (
    <>
      <Title title="Admissions Status" variant="h3" />

      <Paper sx={styles.section}>
        <Box sx={styles.sectionHeader}>
          <Typography variant="h6" component="h1" sx={styles.sectionTitle}>
            Admissions Status
          </Typography>
        </Box>
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.5, sm: 2 }
          }}
        >
          {/* Mobile: Stack vertically, Desktop: Row layout */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            {/* Filter chips and Clear all section */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
                flex: { xs: '1 1 100%', sm: 1 },
                minWidth: 0
              }}
            >
              {selectedFilters?.map((filter) => (
                <FilterChip
                  key={filter}
                  label={getFilterLabel(filter)}
                  onDelete={() => handleRemoveFilter(filter)}
                />
              ))}
              {selectedFilters?.length > 0 && (
                <>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      height: 24,
                      mx: 1
                    }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleClearAll}
                    sx={{
                      ...styles.clearAllButton,
                      minWidth: 'auto',
                      px: { xs: 0.5, sm: 1.5 },
                      fontSize: { xs: '13px', sm: '16px' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Clear all
                  </Button>
                </>
              )}
            </Box>

            {/* Filters button */}
            <Button
              variant="outlined"
              onClick={handleFiltersMenuOpen}
              startIcon={
                <Image
                  src={'/assets/svg/filter.svg'}
                  alt="filter"
                  width={20}
                  height={20}
                />
              }
              endIcon={<ExpandMoreIcon />}
              sx={{
                ...styles.filterButton,
                width: { xs: '100%', sm: 150 },
                minWidth: { xs: 'auto', sm: 150 },
                flexShrink: 0,
                position: 'relative'
              }}
            >
              Filters
            </Button>
          </Stack>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={isFiltersOpen}
          onClose={handleFiltersMenuClose}
          disableScrollLock={true}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          slotProps={{
            paper: {
              sx: styles.filterMenu
            }
          }}
        >
          {FILTER_OPTIONS?.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleFilterToggle(option.value)}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedFilters.includes(option.value)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFilterToggle(option.value);
                    }}
                    sx={styles.filterCheckbox}
                  />
                }
                label={
                  <ListItemText
                    primary={option.label}
                    sx={{ color: COLORS.filtersColor }}
                  />
                }
                sx={{ margin: 0, width: '100%' }}
                onClick={(e) => e.stopPropagation()}
              />
            </MenuItem>
          ))}
        </Menu>
        <Divider />
        {isLoading ? (
          <ApplicationsListSkeleton />
        ) : (
          <Stack spacing={2} p={2}>
            <ApplicationsList
              isScholarship={false}
              applications={filteredApplications}
              isLoading={isLoading}
            />
          </Stack>
        )}
      </Paper>
    </>
  );
};

export default ApplicationsPage;

const FilterChip = ({
  label,
  onDelete
}: {
  label: string;
  onDelete: () => void;
}) => {
  return (
    <Chip
      label={label}
      onDelete={onDelete}
      sx={styles.filterChip}
      variant="filled"
    />
  );
};
