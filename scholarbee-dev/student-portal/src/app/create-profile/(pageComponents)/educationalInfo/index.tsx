/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';
import React, { useEffect, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ButtonsComponent from '../buttonsComponent';
import CustomInput from '../customInput';
import { EducationalBackground, MarksGPA } from '../../constants/types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import IconButton from '@mui/material/IconButton';
import {
  EDUCATIONAL_BG_FIELDS,
  MATRIC_INTERMEDIATE_FIELD_OF_STUDY_OPTIONS,
  getYearOptions
} from './constants';
import { COLORS } from '@/constants/colors';
import { educationalBackgroundSchema } from './schema';
import useEducationalBackground from './useEducationalBackground';
import { useGetMajorsQuery } from '@/redux/api/majorApi';
import { getFormattedMajorsAndDegreeLevels } from '@/utils/helperFunctions';

const EMPTY_EDUCATIONAL_RECORD = {
  education_level: '',
  school_college_university: '',
  field_of_study: '',
  marks_gpa: {
    total_marks_gpa: '',
    obtained_marks_gpa: ''
  },
  year_of_passing: '',
  board: '',
  transcript: '',
  isNewRecord: true
};

interface IEducationalInfo {
  onNext: () => void;
  onPrev: () => void;
}

const EducationInfo = ({ onNext, onPrev }: IEducationalInfo) => {
  const form = useForm<FormData>({
    resolver: zodResolver(educationalBackgroundSchema),
    defaultValues: {
      educational_backgrounds: [EMPTY_EDUCATIONAL_RECORD]
    }
  });

  const {
    openDeleteDialog,
    // recordToDelete,
    editIndex,
    isAddingNew,
    newRecordIndices,
    fields,
    educationLevels,
    errors,

    isLoadingUser,
    isAddingEducation,
    isDeleting,
    isUpdating,
    isRegistering,
    isUpdatingUser,

    handleSubmit,
    onSubmit,
    handleAddMore,
    handleEditEducation,
    handleCancelEdit,
    handleSaveEdit,
    openDeleteConfirmation,
    closeDeleteDialog,
    confirmDelete,
    initializeEducationalBackgrounds,

    control,
    userData
  } = useEducationalBackground(form);

  const { data: majorsFromApi, isLoading: isLoadingMajors } = useGetMajorsQuery(
    {}
  );
  const higherEducationFieldOfStudyOptions = useMemo(
    () => getFormattedMajorsAndDegreeLevels(majorsFromApi ?? []),
    [majorsFromApi]
  );

  useEffect(() => {
    initializeEducationalBackgrounds();
  }, [initializeEducationalBackgrounds]);

  const fieldsLength = fields.length;
  const showDeleteButtons = fieldsLength > 1;

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data, onNext);
  };

  return (
    <Box>
      <Typography fontSize="500" variant="h5" mb={2}>
        Educational Background
      </Typography>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        {isLoadingUser ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ backgroundColor: COLORS.bgColor, p: 2, borderRadius: 2 }}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  position: 'relative',
                  backgroundColor: 'white',
                  mb: 4,
                  p: 2,
                  borderRadius: 2,
                  ...(newRecordIndices.includes(index) && {
                    borderLeft: '3px solid #4caf50'
                  }),
                  ...(editIndex === index && {
                    borderLeft: '3px solid #2196f3'
                  })
                }}
              >
                <Stack
                  sx={{ position: 'absolute', right: 0 }}
                  spacing={2}
                  direction="row"
                >
                  {editIndex === index ? (
                    <>
                      <IconButton
                        onClick={handleSaveEdit}
                        disabled={isDeleting || isAddingEducation || isUpdating}
                      >
                        {isUpdating ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DoneIcon
                            color={
                              isDeleting || isAddingEducation || isUpdating
                                ? 'disabled'
                                : 'success'
                            }
                          />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={handleCancelEdit}
                        disabled={isDeleting || isAddingEducation || isUpdating}
                      >
                        <CloseIcon
                          color={
                            isDeleting || isAddingEducation || isUpdating
                              ? 'disabled'
                              : 'error'
                          }
                        />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      {showDeleteButtons && (
                        <IconButton
                          onClick={() =>
                            openDeleteConfirmation(field?._id, field?.id)
                          }
                          disabled={isDeleting}
                        >
                          <DeleteIcon
                            color={isDeleting ? 'disabled' : 'error'}
                          />
                        </IconButton>
                      )}
                      {!newRecordIndices.includes(index) && (
                        <IconButton
                          disabled={isDeleting}
                          onClick={() => handleEditEducation(index)}
                        >
                          <EditIcon
                            color={isDeleting ? 'disabled' : 'primary'}
                          />
                        </IconButton>
                      )}
                    </>
                  )}
                </Stack>
                <Grid container mt={2} spacing={2}>
                  {EDUCATIONAL_BG_FIELDS.map((fieldConfig, fieldIndex) => {
                    const isTranscript = fieldConfig.name === 'transcript';
                    const isBoard = fieldConfig.name === 'board';
                    const currentEducationLevel =
                      educationLevels[index]?.education_level;
                    const showBoardField = isBoard
                      ? currentEducationLevel === 'Matriculation' ||
                        currentEducationLevel === 'Intermediate'
                      : true;

                    // Skip rendering the board field if not needed
                    if (isBoard && !showBoardField) {
                      return null;
                    }

                    const updatedFieldConfig = {
                      ...fieldConfig,
                      required: isTranscript
                        ? true
                        : isBoard
                          ? showBoardField
                          : fieldConfig.required
                    };

                    if (fieldConfig.name === 'field_of_study') {
                      const level = educationLevels[index]?.education_level;
                      if (
                        level === 'Matriculation' ||
                        level === 'Intermediate'
                      ) {
                        updatedFieldConfig.options =
                          MATRIC_INTERMEDIATE_FIELD_OF_STUDY_OPTIONS;
                      } else if (
                        level === 'Bachelors' ||
                        level === 'Masters' ||
                        level === 'PhD' ||
                        level === 'Doctorate'
                      ) {
                        updatedFieldConfig.options =
                          higherEducationFieldOfStudyOptions;
                      } else {
                        updatedFieldConfig.options = [];
                      }
                    }
                    if (fieldConfig.name === 'year_of_passing') {
                      updatedFieldConfig.options = getYearOptions(
                        index,
                        educationLevels
                      );
                    }

                    return (
                      <Grid
                        size={{
                          xs: 12,
                          sm: updatedFieldConfig.fullWidth ? 12 : 6
                        }}
                        key={fieldIndex}
                      >
                        <Controller
                          name={`educational_backgrounds.${index}.${updatedFieldConfig.name}`}
                          control={control}
                          render={({ field: inputField }) => (
                            <CustomInput
                              label={updatedFieldConfig.label}
                              type={updatedFieldConfig.type}
                              value={
                                updatedFieldConfig.isDouble
                                  ? (inputField.value as MarksGPA)
                                  : (inputField.value as string)
                              }
                              onChange={inputField.onChange}
                              options={updatedFieldConfig.options || []}
                              required={updatedFieldConfig.required}
                              isDouble={updatedFieldConfig.isDouble}
                              error={
                                updatedFieldConfig.isDouble
                                  ? !!errors?.educational_backgrounds?.[index]
                                      ?.marks_gpa
                                  : !!errors?.educational_backgrounds?.[
                                      index
                                    ]?.[
                                      updatedFieldConfig.name as keyof EducationalBackground
                                    ]
                              }
                              helperText={
                                updatedFieldConfig.isDouble
                                  ? [
                                      errors?.educational_backgrounds?.[index]
                                        ?.marks_gpa?.total_marks_gpa?.message,
                                      errors?.educational_backgrounds?.[index]
                                        ?.marks_gpa?.obtained_marks_gpa?.message
                                    ]
                                      .filter(Boolean)
                                      .join(' | ')
                                  : errors?.educational_backgrounds?.[index]?.[
                                      updatedFieldConfig.name as keyof EducationalBackground
                                    ]?.message
                              }
                              uniqueId={`${updatedFieldConfig.name}-${index}`}
                              placeholder={updatedFieldConfig?.placeholder}
                              displayEmpty={
                                updatedFieldConfig.type === 'select'
                              }
                              placeholderLabel={`Select ${updatedFieldConfig.label}`}
                              disabled={
                                isTranscript
                                  ? !newRecordIndices.includes(index) &&
                                    editIndex !== index
                                  : (updatedFieldConfig.name ===
                                      'education_level' &&
                                      !newRecordIndices.includes(index) &&
                                      editIndex !== index) ||
                                    (!newRecordIndices.includes(index) &&
                                      editIndex !== index &&
                                      userData.educational_backgrounds?.length >
                                        0) ||
                                    (updatedFieldConfig.name ===
                                      'field_of_study' &&
                                      isLoadingMajors &&
                                      (currentEducationLevel === 'Bachelors' ||
                                        currentEducationLevel === 'Masters' ||
                                        currentEducationLevel === 'PhD'))
                              }
                            />
                          )}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddMore}
              variant="outlined"
              sx={{ mt: 2, mb: 4 }}
              disabled={isAddingNew}
            >
              Add More
            </Button>

            <ButtonsComponent
              goToPrevStep={onPrev}
              loading={
                isAddingEducation ||
                isUpdating ||
                editIndex !== null ||
                isRegistering ||
                isUpdatingUser
              }
            />
          </Box>
        )}
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Educational Background
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this educational background? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} sx={{ py: 1 }} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            sx={{ py: 1 }}
            color="error"
            variant="contained"
            autoFocus
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationInfo;
