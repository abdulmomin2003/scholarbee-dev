import {
  Box,
  Grid,
  Typography,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import CampusSelect from './campusSelect';
import ProgramSelect from './programSelect';
import TagList from './tagList';
import ActionButtons from './actionButtons';
import PlaceholderField from './placeholderField';
import React from 'react';
import UniversitySelect from './universitySelect';
import { COLORS } from '@/constants/colors';
import {
  FilterFormData,
  Tag,
  University,
  Campus,
  Program,
  UniversityData
} from '../../types';

interface PositionFormData {
  form: UseFormReturn<FilterFormData>;
  programs: Program[];
  campuses: Campus[];
  fetchingPrograms: boolean;
  fetchingCampuses: boolean;
  selectedUniversity: University | null;
  selectedCampus: string;
}

interface PositionFormProps {
  position: number;
  positionData: PositionFormData;
  tags: { [position: number]: Tag | null };
  handleUniversityChange: (position: number, name: string, id: string) => void;
  createOnSubmit: (position: number) => (data: FilterFormData) => void;
  dropdownKey: boolean;
  isEditable: boolean;
}

const PositionForm: React.FC<PositionFormProps> = ({
  position,
  positionData,
  tags,
  handleUniversityChange,
  createOnSubmit,
  dropdownKey,
  isEditable
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const {
    form,
    programs,
    campuses,
    fetchingPrograms,
    fetchingCampuses,
    selectedUniversity,
    selectedCampus
  } = positionData;
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = form;

  // Show placeholder only if not editable AND no tag exists
  if (!isEditable && tags[position] === null) {
    return (
      <Grid size={{ xs: 12, md: 12 }} sx={{ mb: isDesktop ? 4 : 2 }}>
        <Typography
          fontWeight="600"
          variant="h5"
          sx={{ mb: 2, color: '#252525' }}
        >
          {`Compare ${position + 1}`}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'flex-end'
          }}
        >
          <Box sx={{ flex: 1 }}>
            <PlaceholderField variant="outlined" labelText="University" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PlaceholderField variant="outlined" labelText="Campus" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PlaceholderField variant="outlined" labelText="Program" />
          </Box>
          <Button
            disabled
            variant="contained"
            sx={{
              height: '56px',
              minWidth: '104px',
              bgcolor: '#F2F2F3',
              color: '#B0B3B7',
              boxShadow: 'none',
              borderRadius: '8px',
              '&:disabled': {
                bgcolor: '#F2F2F3',
                color: '#B0B3B7'
              }
            }}
          >
            Done
          </Button>
        </Box>
      </Grid>
    );
  }

  return (
    <Grid size={{ xs: 12, md: 12 }} sx={{ mb: isDesktop ? 4 : 2 }}>
      <Box component="form" onSubmit={handleSubmit(createOnSubmit(position))}>
        <Typography
          fontWeight="600"
          variant="h5"
          sx={{ mb: 2, color: '#252525' }}
        >
          {`Compare ${position + 1}`}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'flex-start'
          }}
        >
          <Box sx={{ flex: 1, width: '100%' }}>
            <UniversitySelect
              control={control}
              errors={errors}
              dropdownKey={dropdownKey}
              handleUniversityChange={(name: string, id: string) =>
                handleUniversityChange(position, name, id)
              }
            />
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            <CampusSelect
              fullWidth
              control={control}
              errors={errors}
              campuses={campuses}
              fetchingCampuses={fetchingCampuses}
              watch={watch}
              selectedUniversity={selectedUniversity}
            />
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            <ProgramSelect
              fullWidth
              control={control}
              errors={errors}
              programs={programs}
              fetchingPrograms={fetchingPrograms}
              selectedCampus={selectedCampus}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            disabled={
              !selectedUniversity || !selectedCampus || !watch('program')
            }
            sx={{
              mt: { xs: 2, md: '28px' }, // Align with inputs when they have labels
              height: '56px',
              minWidth: '104px',
              bgcolor:
                !selectedUniversity || !selectedCampus || !watch('program')
                  ? '#F2F2F3'
                  : COLORS.primary,
              color:
                !selectedUniversity || !selectedCampus || !watch('program')
                  ? '#B0B3B7'
                  : 'white',
              boxShadow: 'none',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 400,
              fontSize: '16px',
              '&:hover': {
                bgcolor: COLORS.primaryDark
              },
              '&:disabled': {
                bgcolor: '#F2F2F3',
                color: '#B0B3B7'
              }
            }}
          >
            Done
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};

interface FilterFormProps {
  position0: PositionFormData;
  position1: PositionFormData;
  tags: { [position: number]: Tag | null };
  dropdownKeys: { [position: number]: boolean };
  handleUniversityChange: (position: number, name: string, id: string) => void;
  createOnSubmit: (position: number) => (data: FilterFormData) => void;
  getTagsCount: () => number;
  handleDelete: (id: string) => void;
  handleReset: () => void;
  handleCompare: () => Promise<void>;
  isComparing: boolean;
  isComparisonCompleted: boolean;
  comparisonData: UniversityData[] | null;
}

const FilterForm: React.FC<FilterFormProps> = (props) => {
  const {
    position0,
    position1,
    tags,
    dropdownKeys,
    handleUniversityChange,
    createOnSubmit,
    getTagsCount,
    handleDelete,
    handleReset,
    handleCompare,
    isComparing
  } = props;

  const isPosition0Editable = true;
  const isPosition1Editable = tags[1] === null;

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {/* Top Box: Tags and Actions */}
      <Box
        sx={{
          bgcolor: 'white',
          p: { xs: 2, md: 3 },
          borderRadius: '16px',
          mb: 4,
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between',
          alignItems: { lg: 'center' },
          gap: 3
        }}
      >
        <TagList tags={tags} handleDelete={handleDelete} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
          <ActionButtons
            getTagsCount={getTagsCount}
            handleCompare={handleCompare}
            handleReset={handleReset}
            isComparing={isComparing}
          />
        </Box>
      </Box>

      {/* Bottom Box: Filters */}
      <Box
        sx={{
          bgcolor: 'white',
          p: { xs: 2, md: 4 },
          borderRadius: '16px',
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)'
        }}
      >
        <Grid container spacing={isComparing ? 0 : 2}>
          <PositionForm
            position={0}
            positionData={position0}
            tags={tags}
            handleUniversityChange={handleUniversityChange}
            createOnSubmit={createOnSubmit}
            dropdownKey={dropdownKeys[0]}
            isEditable={isPosition0Editable}
          />
          <PositionForm
            position={1}
            positionData={position1}
            tags={tags}
            handleUniversityChange={handleUniversityChange}
            createOnSubmit={createOnSubmit}
            dropdownKey={dropdownKeys[1]}
            isEditable={isPosition1Editable}
          />
        </Grid>
      </Box>
    </Box>
  );
};

export default FilterForm;
