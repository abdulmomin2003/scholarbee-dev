/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState, useCallback, useEffect, useRef } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  useGetUserQuery,
  useAddEducationalBackgroundMutation,
  useDeleteEducationalBackgroundMutation,
  useUpdateEducationalBackgroundMutation,
  useUpdateUserMutation
} from '@/redux/api/userApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRegisterEventMutation } from '@/redux/api/analyticsApi';

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

export const useEducationalBackground = (form: UseFormReturn<FormData>) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRecordIndices, setNewRecordIndices] = useState<number[]>([]);
  const [isInitialEmptyState, setIsInitialEmptyState] = useState(false);
  const [originalEditValues, setOriginalEditValues] = useState<any>(null);

  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();
  const [addEducationalBackground, { isLoading: isAddingEducation }] =
    useAddEducationalBackgroundMutation();
  const [deleteEducationalBackground, { isLoading: isDeleting }] =
    useDeleteEducationalBackgroundMutation();
  const [updateEducation, { isLoading: isUpdating }] =
    useUpdateEducationalBackgroundMutation();
  const [registerEvent, { isLoading: isRegistering }] =
    useRegisterEventMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    clearErrors,
    formState: { errors, isDirty }
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'educational_backgrounds'
  });

  const educationLevels = watch('educational_backgrounds');

  const previousLevelsRef = useRef<string[]>([]);

  const watchedLevels = Array.from({ length: fields.length }, (_, index) =>
    watch(`educational_backgrounds.${index}.education_level`)
  );

  useEffect(() => {
    watchedLevels.forEach((currentLevel, index) => {
      const previousLevel = previousLevelsRef.current[index];

      if (previousLevel && previousLevel !== currentLevel && currentLevel) {
        setValue(`educational_backgrounds.${index}.field_of_study`, '', {
          shouldValidate: false,
          shouldDirty: true
        });

        setValue(
          `educational_backgrounds.${index}.marks_gpa`,
          {
            total_marks_gpa: '',
            obtained_marks_gpa: ''
          },
          {
            shouldValidate: false,
            shouldDirty: true
          }
        );
      }
    });

    previousLevelsRef.current = watchedLevels.filter(Boolean);
  }, [watchedLevels, setValue]);

  // Initialize educational backgrounds or set initial empty state
  const initializeEducationalBackgrounds = useCallback(() => {
    if (userData?.educational_backgrounds?.length) {
      // If there is existing data, use it
      const edBg = userData.educational_backgrounds.map((bg: any) => ({
        ...bg,
        _id: bg?._id || '',
        isNewRecord: false
      }));
      reset({ educational_backgrounds: edBg });
      setNewRecordIndices([]);
      setIsInitialEmptyState(false);
    } else {
      // If there's no data, mark the initial empty field as a new record
      setIsInitialEmptyState(true);
      setNewRecordIndices([0]);
    }
  }, [userData, reset]);

  // This effect runs only once after component mount to handle the initial empty state
  useEffect(() => {
    if (
      !isLoadingUser &&
      userData &&
      !userData?.educational_backgrounds?.length
    ) {
      setIsInitialEmptyState(true);
      setNewRecordIndices([0]);
    }
  }, [isLoadingUser, userData]);

  const admissionState = useSelector((state: RootState) => state.admission);
  const { campusId, programId, admissionProgramId, universityId } =
    admissionState;

  const onSubmit = useCallback(
    async (data: FormData, onNext: () => void) => {
      try {
        await registerEvent({
          step: 'profile/education',
          universityId: universityId,
          admissionProgramId: admissionProgramId,
          programId: programId,
          eventType: 'navigate',
          campusId: campusId
        });

        if (!isDirty && !isInitialEmptyState && userData?.current_stage > 2) {
          onNext();
          return;
        }
        const userId = userData?._id || '';

        let indicesToSubmit = [...newRecordIndices];

        if (isInitialEmptyState && !newRecordIndices.includes(0)) {
          indicesToSubmit = [0, ...indicesToSubmit];
        }

        const newBackgrounds = indicesToSubmit.map((index) => {
          const {
            education_level,
            school_college_university,
            field_of_study,
            marks_gpa,
            year_of_passing,
            board,
            transcript
          } = data.educational_backgrounds[index];

          const backgroundData: any = {
            education_level,
            school_college_university,
            field_of_study,
            marks_gpa,
            year_of_passing,
            board
          };

          // Only include transcript if it has a value
          if (transcript && transcript.trim() !== '') {
            backgroundData.transcript = transcript;
          }

          return backgroundData;
        });

        if (newBackgrounds.length > 0) {
          if (newBackgrounds.length === 1) {
            await addEducationalBackground({
              user_id: userId,
              data: newBackgrounds[0]
            }).unwrap();
          } else {
            const addPromises = newBackgrounds.map((background) => {
              return addEducationalBackground({
                user_id: userId,
                data: background
              }).unwrap();
            });

            await Promise.all(addPromises);
          }

          toast.success('Educational backgrounds added successfully');
          setIsInitialEmptyState(false); // Reset the initial empty state after successful submission
        }

        if (userData?.current_stage === 2) {
          await updateUser({
            user_id: userData?._id || '',
            data: {
              ...(userData?.current_stage === 2 && { current_stage: 3 })
            }
          }).unwrap();
        }

        onNext();
      } catch (error) {
        console.log('error', error);
        toast.error('Failed to add educational backgrounds');
      }
    },
    [
      registerEvent,
      universityId,
      admissionProgramId,
      programId,
      campusId,
      isDirty,
      isInitialEmptyState,
      userData?._id,
      userData?.current_stage,
      newRecordIndices,
      updateUser,
      addEducationalBackground
    ]
  );

  const handleAddMore = useCallback(() => {
    if (isAddingNew) return;

    setIsAddingNew(true);

    setTimeout(() => {
      const newIndex = fields.length;
      append(EMPTY_EDUCATIONAL_RECORD);
      setNewRecordIndices((prev) => [...prev, newIndex]);
      setIsAddingNew(false);
    }, 10);
  }, [append, fields.length, isAddingNew]);

  const handleEditEducation = useCallback(
    (index: number) => {
      // Store the original values before editing
      const currentValues = educationLevels[index];
      setOriginalEditValues({ ...currentValues });
      setEditIndex(index);
    },
    [educationLevels]
  );

  const handleCancelEdit = useCallback(() => {
    if (editIndex !== null && originalEditValues) {
      // Restore original values for each field
      Object.keys(originalEditValues).forEach((key) => {
        if (key !== 'isNewRecord' && key !== '_id' && key !== 'id') {
          setValue(
            `educational_backgrounds.${editIndex}.${key}`,
            originalEditValues[key],
            { shouldValidate: false, shouldDirty: false }
          );
        }
      });

      // Clear validation errors for this specific educational background
      clearErrors(`educational_backgrounds.${editIndex}`);
    }
    setEditIndex(null);
    setOriginalEditValues(null);
  }, [editIndex, originalEditValues, setValue, clearErrors]);

  const handleSaveEdit = useCallback(async () => {
    if (editIndex !== null) {
      // First, validate the specific educational background entry being edited
      const isValid = await trigger(`educational_backgrounds.${editIndex}`);

      if (!isValid) {
        return;
      }

      const updatedRecord = educationLevels[editIndex];
      const userId = userData?._id || '';
      const recordId = updatedRecord?._id || updatedRecord?.id;

      if (newRecordIndices.includes(editIndex) || isInitialEmptyState) {
        toast.info('Changes will be saved when you submit the form');
        setEditIndex(null);
        setOriginalEditValues(null);
        return;
      }

      try {
        // Format the data to match the API requirements
        const dataToUpdate: any = {
          education_level: updatedRecord.education_level,
          school_college_university: updatedRecord.school_college_university,
          field_of_study: updatedRecord.field_of_study,
          marks_gpa: updatedRecord.marks_gpa,
          year_of_passing: updatedRecord.year_of_passing,
          board: updatedRecord.board
        };

        // Only include transcript if it has a value
        if (
          updatedRecord.transcript &&
          updatedRecord.transcript.trim() !== ''
        ) {
          dataToUpdate.transcript = updatedRecord.transcript;
        }

        // Call the update mutation
        await updateEducation({
          user_id: userId,
          educational_background_id: recordId,
          data: dataToUpdate
        }).unwrap();

        toast.success('Educational background updated successfully');

        setEditIndex(null);
        setOriginalEditValues(null);
      } catch (error) {
        console.error('Failed to update educational background:', error);
        toast.error('Failed to update educational background');
        // Keep edit mode active on API error so user can try again
      }
    }
  }, [
    editIndex,
    educationLevels,
    userData?._id,
    newRecordIndices,
    updateEducation,
    isInitialEmptyState,
    trigger
  ]);

  const openDeleteConfirmation = useCallback(
    (recordId: string, fieldId: string) => {
      const indexToRemove = fields.findIndex((field) => field.id === fieldId);

      if (newRecordIndices.includes(indexToRemove)) {
        setTimeout(() => {
          setNewRecordIndices((prev) => {
            return prev
              .filter((idx) => idx !== indexToRemove)
              .map((idx) => (idx > indexToRemove ? idx - 1 : idx));
          });

          if (editIndex === indexToRemove) {
            setEditIndex(null);
            setOriginalEditValues(null);
          } else if (editIndex !== null && editIndex > indexToRemove) {
            setEditIndex(editIndex - 1);
          }

          remove(indexToRemove);
          toast.success('Educational background removed');
        }, 10);
        return;
      }

      setRecordToDelete(recordId);
      setOpenDeleteDialog(true);
    },
    [fields, newRecordIndices, remove, editIndex]
  );

  const closeDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setRecordToDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (recordToDelete) {
      try {
        const userId = userData?._id || '';
        await deleteEducationalBackground({
          user_id: userId,
          educational_background_id: recordToDelete
        }).unwrap();

        setTimeout(() => {
          const indexToRemove = fields.findIndex(
            (field) => field._id === recordToDelete
          );

          if (indexToRemove !== -1) {
            setNewRecordIndices((prev) => {
              return prev.map((idx) => (idx > indexToRemove ? idx - 1 : idx));
            });

            if (editIndex === indexToRemove) {
              setEditIndex(null);
              setOriginalEditValues(null);
            } else if (editIndex !== null && editIndex > indexToRemove) {
              setEditIndex(editIndex - 1);
            }

            remove(indexToRemove);
          }

          toast.success('Educational background deleted successfully');
        }, 10);
      } catch (error) {
        console.log('error', error);
        toast.error('Failed to delete educational background');
      } finally {
        closeDeleteDialog();
      }
    }
  }, [
    closeDeleteDialog,
    deleteEducationalBackground,
    fields,
    recordToDelete,
    remove,
    userData?._id,
    editIndex
  ]);

  // Cleanup effect to reset edit state if component unmounts
  useEffect(() => {
    return () => {
      setEditIndex(null);
      setOriginalEditValues(null);
    };
  }, []);

  return {
    // State
    openDeleteDialog,
    recordToDelete,
    editIndex,
    isAddingNew,
    newRecordIndices,
    fields,
    educationLevels,
    errors,
    isInitialEmptyState,

    // Loading states
    isLoadingUser,
    isAddingEducation,
    isDeleting,
    isUpdating,
    isRegistering,
    isUpdatingUser,

    // Methods
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

    // Form control
    control,

    // Data
    userData
  };
};

export default useEducationalBackground;
