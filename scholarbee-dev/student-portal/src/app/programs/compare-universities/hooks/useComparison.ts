/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { useCompareUniversitiesMutation } from '@/redux/api/compareFiltersApi';
import { useComparisonFilters } from './useComparisonFilters';
import { FilterFormData, Tag, UniversityData } from '../types';
import { toast } from 'react-toastify';

export const useComparison = () => {
  const [tags, setTags] = useState<{ [position: number]: Tag | null }>({
    0: null,
    1: null
  });
  const [dropdownKeys, setDropdownKeys] = useState<{
    [position: number]: boolean;
  }>({
    0: false,
    1: false
  });
  const [comparisonData, setComparisonData] = useState<UniversityData[] | null>(
    null
  );
  const [isComparisonCompleted, setIsComparisonCompleted] = useState(false);
  const [showDifferences, setShowDifferences] = useState(false);

  const { position0, position1 } = useComparisonFilters();

  const [compareUniversities, { isLoading: isComparing }] =
    useCompareUniversitiesMutation();

  const formatComparisonData = useCallback((data: any[]): UniversityData[] => {
    return data.map((item) => ({
      _id: item._id,
      universityName: item.universityName || '-',
      programName: item.programName || '-',
      major: item.major || '-',
      duration: item.duration || '-',
      creditHours: item.creditHours || '-',
      degreeLevel: item.degreeLevel || '-',
      modeOfStudy: item.modeOfStudy || '-',
      languageOfInstruction: item.languageOfInstruction || '-',
      campusName: item.campusName || '-',
      campusLogo: item.campusLogo || '',
      universityRanking: item.universityRanking || '-',
      totalTuitionFee: item.totalTuitionFee ?? item.totalFirstSemesterFee ?? 0,
      totalApplicationFee: item.totalApplicationFee ?? 0,
      totalFee: item.totalFee ?? item.totalRegularSemesterFee ?? 0,
      totalFirstSemesterFee: item.totalFirstSemesterFee ?? 0,
      totalRegularSemesterFee: item.totalRegularSemesterFee ?? 0,
      campusAddress: {
        city: item.campusAddress?.city ?? '-',
        country: item.campusAddress?.country ?? '-'
      }
    }));
  }, []);

  const reorderComparisonData = useCallback(
    (
      data: UniversityData[],
      tags: { [position: number]: Tag | null }
    ): UniversityData[] => {
      const programIdToPosition = new Map<string, number>();

      Object.entries(tags).forEach(([position, tag]) => {
        if (tag) {
          programIdToPosition.set(tag._id, parseInt(position));
        }
      });

      return data.sort((a, b) => {
        const positionA = programIdToPosition.get(a._id) ?? 0;
        const positionB = programIdToPosition.get(b._id) ?? 0;
        return positionA - positionB;
      });
    },
    []
  );

  const handleCompare = useCallback(async () => {
    try {
      setComparisonData(null);
      setIsComparisonCompleted(false);

      // Get all valid tag IDs
      const validTags = Object.values(tags).filter(
        (tag): tag is Tag => tag !== null
      );
      const programIds = validTags.map((tag) => tag._id);

      const response = await compareUniversities(programIds).unwrap();

      const formattedData = Array.isArray(response)
        ? formatComparisonData(response)
        : response.comparison && Array.isArray(response.comparison)
          ? formatComparisonData(response.comparison)
          : null;

      if (!formattedData) {
        throw new Error('Unexpected response format');
      }

      const reorderedData = reorderComparisonData(formattedData, tags);

      setComparisonData(reorderedData);
      setIsComparisonCompleted(true);
    } catch (error: unknown) {
      console.error('Failed to compare universities:', error);
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message
          : 'Failed to compare';
      toast.error(errorMessage);
      setComparisonData(null);
      setIsComparisonCompleted(false);
      throw error;
    }
  }, [tags, compareUniversities, formatComparisonData, reorderComparisonData]);

  const getTagsCount = useCallback(() => {
    return Object.values(tags).filter(Boolean).length;
  }, [tags]);

  // Helper to get form data for a specific position
  const getPositionForm = useCallback(
    (position: number) => {
      switch (position) {
        case 0:
          return position0;
        case 1:
          return position1;
        default:
          return position0;
      }
    },
    [position0, position1]
  );

  // Clear form fields for a specific position
  const clearFormFields = useCallback(
    (position: number) => {
      const positionForm = getPositionForm(position);
      positionForm.form.setValue('university', null);
      positionForm.form.setValue('campus', '');
      positionForm.form.setValue('program', '');
      setDropdownKeys((prev) => ({
        ...prev,
        [position]: !prev[position]
      }));
    },
    [getPositionForm]
  );

  // Handle university change for a specific position
  const handleUniversityChange = useCallback(
    (position: number, name = '', id = '') => {
      const positionForm = getPositionForm(position);
      positionForm.form.setValue('university', { id, name });
      positionForm.form.setValue('campus', '');
      positionForm.form.setValue('program', '');
    },
    [getPositionForm]
  );

  const handleDelete = useCallback(
    (tagId: string) => {
      let positionToDelete = -1;
      for (let i = 0; i < 3; i++) {
        if (tags[i]?._id === tagId) {
          positionToDelete = i;
          break;
        }
      }

      if (positionToDelete >= 0) {
        setTags((prev) => ({
          ...prev,
          [positionToDelete]: null
        }));
        setComparisonData(null);
        setIsComparisonCompleted(false);
        clearFormFields(positionToDelete);
      }
    },
    [clearFormFields, tags]
  );

  const handleReset = useCallback(() => {
    setTags({
      0: null,
      1: null
    });
    setComparisonData(null);
    setIsComparisonCompleted(false);
    clearFormFields(0);
    clearFormFields(1);
    position0.form.reset();
    position1.form.reset();
  }, [clearFormFields, position0, position1]);

  // Create onSubmit handler for each position
  const createOnSubmit = useCallback(
    (position: number) => {
      return (data: FilterFormData) => {
        // Validate required fields
        if (!data.university || !data.campus || !data.program) {
          const positionForm = getPositionForm(position);
          if (!data.university) {
            positionForm.form.setError('university', {
              type: 'manual',
              message: 'Please select a university'
            });
          }
          if (!data.campus) {
            positionForm.form.setError('campus', {
              type: 'manual',
              message: 'Please select a campus'
            });
          }
          if (!data.program) {
            positionForm.form.setError('program', {
              type: 'manual',
              message: 'Please select a program'
            });
          }
          return;
        }

        // Check if we're at max capacity (only when adding new, not updating)
        const existingTag = tags[position];
        if (!existingTag && getTagsCount() >= 2) {
          return;
        }

        // Check if program is already selected in other positions (exclude current position)
        const isProgramAlreadySelected = Object.entries(tags).some(
          ([tagPosition, tag]) =>
            parseInt(tagPosition) !== position && tag?._id === data.program
        );

        if (isProgramAlreadySelected) {
          const positionForm = getPositionForm(position);
          positionForm.form.setError('program', {
            type: 'manual',
            message: 'This program is already selected for comparison'
          });
          return;
        }

        const positionForm = getPositionForm(position);

        // Find the selected program and campus
        let selectedProgram = positionForm.programs.find(
          (p: { _id: string }) => p._id === data.program
        );
        let selectedCampusData = positionForm.campuses.find(
          (c: { _id: string }) => c._id === data.campus
        );

        // If program not found, try to find it in all programs (might be from a different query)
        // This can happen if the programs list hasn't updated yet
        if (!selectedProgram && data.program) {
          // Try to find in all position forms' programs
          const allPrograms = [...position0.programs, ...position1.programs];
          // Remove duplicates by ID
          const uniquePrograms = allPrograms.filter(
            (program, index, self) =>
              index === self.findIndex((p) => p._id === program._id)
          );
          selectedProgram = uniquePrograms.find(
            (p: { _id: string }) => p._id === data.program
          );
        }

        // If campus not found, try to find it in all campuses
        if (!selectedCampusData && data.campus) {
          const allCampuses = [...position0.campuses, ...position1.campuses];
          // Remove duplicates by ID
          const uniqueCampuses = allCampuses.filter(
            (campus, index, self) =>
              index === self.findIndex((c) => c._id === campus._id)
          );
          selectedCampusData = uniqueCampuses.find(
            (c: { _id: string }) => c._id === data.campus
          );
        }

        // If programs are still loading, wait a moment
        if (
          (!selectedProgram || !selectedCampusData) &&
          (positionForm.fetchingPrograms || positionForm.fetchingCampuses)
        ) {
          // Data is still loading, show a helpful message
          if (!selectedProgram && positionForm.fetchingPrograms) {
            positionForm.form.setError('program', {
              type: 'manual',
              message: 'Programs are loading. Please wait a moment.'
            });
          }
          if (!selectedCampusData && positionForm.fetchingCampuses) {
            positionForm.form.setError('campus', {
              type: 'manual',
              message: 'Campuses are loading. Please wait a moment.'
            });
          }
          return;
        }

        // If still not found after checking all sources, show error
        if (!selectedProgram || !selectedCampusData) {
          if (!selectedProgram) {
            positionForm.form.setError('program', {
              type: 'manual',
              message:
                'Program not found. Please reselect the program from the dropdown.'
            });
          }
          if (!selectedCampusData) {
            positionForm.form.setError('campus', {
              type: 'manual',
              message:
                'Campus not found. Please reselect the campus from the dropdown.'
            });
          }
          return;
        }

        const newTag: Tag = {
          _id: selectedProgram._id,
          university: data.university?.name ?? '',
          campus: selectedCampusData.name,
          program: selectedProgram.name
        };

        setTags((prev) => {
          const nextTags = {
            ...prev,
            [position]: newTag
          };

          return nextTags;
        });

        // Always reset comparison state when adding/updating a program
        if (isComparisonCompleted) {
          setComparisonData(null);
          setIsComparisonCompleted(false);
        }

        // Clear any previous errors
        positionForm.form.clearErrors();
      };
    },
    [
      tags,
      getTagsCount,
      isComparisonCompleted,
      getPositionForm,
      position0,
      position1
    ]
  );

  return {
    position0,
    position1,
    comparisonData,
    isComparing,
    tags,
    dropdownKeys,
    getTagsCount,
    handleUniversityChange,
    handleDelete,
    handleReset,
    createOnSubmit,
    handleCompare,
    isComparisonCompleted,
    showDifferences,
    setShowDifferences
  };
};
