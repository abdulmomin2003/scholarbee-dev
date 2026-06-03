/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
// import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetCampusProgramsQuery } from '@/redux/api/programApi';
import { Program } from '@/types/program';
import Pagination from '@/components/molecules/Pagination';
import { Stack } from '@mui/material';
import { useDebouncedValue } from '@/utils/useDebouncedValue';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontWeight: 600,
    fontSize: '14px',
    whiteSpace: 'nowrap',
    padding: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      fontSize: '12px'
    }
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '14px',
    color: '#333333',
    padding: theme.spacing(1.5),
    wordBreak: 'break-word',
    [theme.breakpoints.down('sm')]: {
      fontSize: '12px',
      padding: theme.spacing(1),
      maxWidth: '150px'
    }
  }
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(11, 60, 149, 0.03)'
  },
  '&:nth-of-type(even)': {
    backgroundColor: 'rgba(11, 60, 149, 0.02)'
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  },
  '&:hover': {
    backgroundColor: 'rgba(11, 60, 149, 0.05)'
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4)
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  color: theme.palette.error.main
}));

const EmptyContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F5F5F5',
    borderRadius: theme.spacing(1),
    '& fieldset': {
      borderColor: 'transparent'
    },
    '&:hover fieldset': {
      borderColor: 'transparent'
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main
    }
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: '#F5F5F5',
  borderRadius: theme.spacing(1),
  height: '40px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main
  },
  '& .MuiSelect-select': {
    padding: '8px 14px'
  }
}));

interface ProgramsTableProps {
  campusId: string;
  cityName: string;
}

export default function ProgramsTable({
  cityName,
  campusId
}: ProgramsTableProps) {
  const params = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const {
    data: programsData,
    isLoading,
    error,
    isFetching
  } = useGetCampusProgramsQuery({
    campusId,
    page: currentPage,
    limit: 10,
    search: debouncedSearch || undefined,
    degree_level: selectedDegree || undefined,
    academic_departments: selectedDepartment || undefined,
    duration: selectedDuration || undefined
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const uniqueValues = useMemo(() => {
    if (!programsData) {
      return { degrees: [], departments: [], durations: [] };
    }

    const degrees =
      (programsData as any).availableFilters?.degree_level ||
      Array.from(
        new Set(
          programsData.programs
            .map((p: Program) => p.degree_level)
            .filter((d: string | undefined): d is string => !!d)
        )
      ).sort();

    const departments =
      (programsData as any).availableFilters?.academic_departments ||
      Array.from(
        new Set(
          programsData.programs
            .map((p: Program) => (p as any).academic_departments)
            .filter((d: any) => d && d.id)
        )
      ).map((d: any) => ({ id: d.id, name: d.name }));

    const durations =
      (programsData as any).availableFilters?.duration ||
      Array.from(
        new Set(
          programsData.programs
            .map((p: Program) => p.duration)
            .filter((d: string | undefined): d is string => !!d)
        )
      ).sort();

    return { degrees, departments, durations };
  }, [programsData]);

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return 'N/A';
    if (duration.includes('months')) {
      const months = parseInt(duration.replace(/\D/g, ''));
      const years = Math.round((months / 12) * 10) / 10;
      return `${years} Years`;
    }
    return duration;
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text?.length <= maxLength) return text;
    return `${text?.substring(0, maxLength)}...`;
  };

  const toParamString = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const citySlug =
    toParamString(params?.city as string | string[] | undefined) ||
    toParamString(params?.citySlug as string | string[] | undefined);
  const campusSlug =
    toParamString(params?.campus as string | string[] | undefined) ||
    toParamString(params?.uniSlug as string | string[] | undefined);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedDegree, selectedDepartment, selectedDuration, debouncedSearch]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading programs...
        </Typography>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <Typography variant="body1">
          Failed to fetch programs. Please try again.
        </Typography>
      </ErrorContainer>
    );
  }

  return (
    <Box>
      {isFilterMenuOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            backgroundColor: 'rgba(164, 167, 174, 0.26)',
            backdropFilter: 'blur(1px)'
          }}
        />
      )}
      <Typography component="h2" mb={2} variant="h6">
        {`Programs Offered at ${cityName} Campus`}
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        mb={3}
        sx={{
          width: '100%'
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', sm: 'auto' },
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            maxWidth: { xs: '100%', sm: '250px' }
          }}
        >
          <SearchInput
            fullWidth
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={2}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            flex: { xs: '1 1 100%', sm: '0 0 auto' }
          }}
        >
          <FormControl
            size="small"
            sx={{
              width: { xs: '100%', sm: '150px' },
              minWidth: { xs: 'unset', sm: '150px' }
            }}
          >
            <StyledSelect
              value={selectedDegree}
              onChange={(e: any) => setSelectedDegree(e.target.value)}
              onOpen={() => setIsFilterMenuOpen(true)}
              onClose={() => setIsFilterMenuOpen(false)}
              displayEmpty
              input={<InputBase />}
            >
              <MenuItem value="">All Degrees</MenuItem>
              {uniqueValues.degrees.map((degree: string) => (
                <MenuItem key={degree} value={degree} title={degree}>
                  {truncateText(degree, 25)}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: { xs: '100%', sm: '200px' },
              minWidth: { xs: 'unset', sm: '200px' }
            }}
          >
            <StyledSelect
              value={selectedDepartment}
              onChange={(e: any) => setSelectedDepartment(e.target.value)}
              onOpen={() => setIsFilterMenuOpen(true)}
              onClose={() => setIsFilterMenuOpen(false)}
              displayEmpty
              input={<InputBase />}
            >
              <MenuItem value="">All Departments</MenuItem>
              {uniqueValues?.departments?.map((dept: any) => (
                <MenuItem key={dept?.id} value={dept?.id} title={dept?.name}>
                  {truncateText(dept?.name, 30)}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: { xs: '100%', sm: '150px' },
              minWidth: { xs: 'unset', sm: '150px' }
            }}
          >
            <StyledSelect
              value={selectedDuration}
              onChange={(e: any) => setSelectedDuration(e.target.value)}
              onOpen={() => setIsFilterMenuOpen(true)}
              onClose={() => setIsFilterMenuOpen(false)}
              displayEmpty
              input={<InputBase />}
            >
              <MenuItem value="">All Durations</MenuItem>
              {uniqueValues?.durations?.map((duration: string) => (
                <MenuItem
                  key={duration}
                  value={duration}
                  title={formatDuration(duration)}
                >
                  {truncateText(formatDuration(duration), 20)}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
        </Stack>
      </Stack>

      {!programsData?.programs || programsData.programs.length === 0 ? (
        <EmptyContainer>
          <Typography variant="body1">
            No programs found matching your filters.
          </Typography>
        </EmptyContainer>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: 'none',
              border: '1px solid #E0E0E0',
              overflowX: 'auto',
              width: '100%'
            }}
          >
            <Table
              sx={{
                minWidth: { xs: 760, sm: 900 },
                width: '100%'
              }}
              aria-label="programs table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>Program Name</StyledTableCell>
                  <StyledTableCell>Degree</StyledTableCell>
                  <StyledTableCell>Department</StyledTableCell>
                  <StyledTableCell>Duration</StyledTableCell>
                  <StyledTableCell align="right">
                    View Program details
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isFetching && !isLoading ? (
                  <TableRow
                    sx={{
                      height: '250px',
                      backgroundColor: 'rgba(11, 60, 149, 0.03)'
                    }}
                  >
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {programsData.programs.map((program: Program) => (
                      <StyledTableRow key={program._id}>
                        <StyledTableCell component="th" scope="row">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: '12px', sm: '14px' },
                              wordBreak: 'break-word'
                            }}
                          >
                            {program.name}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                          >
                            {program.degree_level || 'N/A'}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                          >
                            {(program as any).academic_departments?.name ||
                              program.major ||
                              'N/A'}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                          >
                            {formatDuration(program.duration)}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {(() => {
                            const seoTitleKey =
                              (program as Program & { seo_title_key?: string })
                                .seo_title_key ||
                              (program as Program & { slug?: string }).slug;
                            const programPath =
                              seoTitleKey && citySlug && campusSlug
                                ? `/program-details/${seoTitleKey}/${citySlug}/${campusSlug}`
                                : '#';

                            return (
                              <Typography
                                component={Link}
                                href={programPath}
                                prefetch
                                variant="body2"
                                sx={{
                                  fontSize: { xs: '12px', sm: '14px' },
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                  textUnderlineOffset: '2px',
                                  whiteSpace: 'nowrap',
                                  '&:hover': { opacity: 0.8 }
                                }}
                              >
                                View Program Detail
                              </Typography>
                            );
                          })()}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {programsData.meta.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={programsData.meta.totalPages}
              onPageChange={handlePageChange}
              totalItems={programsData.meta.total}
              itemsPerPage={10}
            />
          )}
        </>
      )}
    </Box>
  );
}
