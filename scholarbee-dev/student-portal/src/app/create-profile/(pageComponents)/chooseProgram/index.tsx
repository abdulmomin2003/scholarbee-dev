'use client';
import { Box, Stack, Typography, Collapse } from '@mui/material';
import React, { Suspense } from 'react';
import CustomInput from '../customInput';
import ButtonsComponent from '../buttonsComponent';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { setApplicationId } from '@/redux/slices/admissionSlice';
import { useGetProgramsByAcademicDepartmentQuery } from '@/redux/api/admissionProgramsApi';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomTypography } from '@/components/atoms/customTypography';
import { toast } from 'react-toastify';
import {
  useApplyForProgramMutation,
  useGetApplicationDetailsQuery
} from '@/redux/api/applicationApi';
import Cookies from 'js-cookie';
import ChooseProgramSkeleton from './(pageComponents)/skelton';
import { ErrorBoundary } from 'react-error-boundary';
import { MarksGPA } from '../../constants/types';
import { useRegisterEventMutation } from '@/redux/api/analyticsApi';
import { useGetUserQuery } from '@/redux/api/userApi';

const ChooseProgramSchema = z
  .object({
    selectedDepartments: z
      .array(z.string())
      .min(1, 'Please select at least one department'),
    preferences: z.record(z.string(), z.array(z.string()))
  })
  .superRefine((data, ctx) => {
    data.selectedDepartments.forEach((deptId) => {
      const prefs = data.preferences[deptId] || [];
      if (!prefs[0]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'First preference is required',
          path: ['preferences', deptId, 0]
        });
      }
    });
  });

type ChooseProgramFormValues = z.infer<typeof ChooseProgramSchema>;

const ChooseProgramContent = ({
  onPrev,
  onNext,
  isApplicationDraft,
  applicationId,
  onOpenVerificationModal
}: {
  onPrev: () => void;
  onNext: () => void;
  isApplicationDraft: boolean;
  applicationId?: string;
  onOpenVerificationModal?: () => void;
}) => {
  const [programDepartment, setProgramDepartment] = React.useState<{
    id: string;
    name: string;
    process_fee: number;
    programs: Array<{ id: string; name: string }>;
    preferences: Array<{ program: string; preference_order: string }>;
  } | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const admissionState = useSelector((state: RootState) => state.admission);
  const {
    campusId,
    programId,
    //  admissionId,
    admissionProgramId,
    universityId
  } = admissionState;

  const userId = Cookies.get('userId');
  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();
  const isVerified = userData?._verified;

  //get department id from the store
  const departmentId = useSelector(
    (state: RootState) => state.admission.departmentId
  );

  // Fetch programs for the department
  const {
    data: departmentProgramsData,
    isLoading: isLoadingPrograms,
    error: programsError
  } = useGetProgramsByAcademicDepartmentQuery(departmentId || '', {
    skip: !departmentId
  });

  console.log('programDepartment', programDepartment);

  // Fetch application details if applicationId exists to restore preferences
  const {
    data: applicationDetailsData
    // isLoading: isLoadingApplicationDetails
  } = useGetApplicationDetailsQuery(applicationId, {
    skip: !applicationId
  });

  // Transform API response to match expected structure
  const departmentPrograms = React.useMemo(() => {
    if (!departmentProgramsData) return [];
    return departmentProgramsData?.map(
      (item: { program_name: string; admission_program_id: string }) => ({
        id: item.admission_program_id,
        name: item.program_name
      })
    );
  }, [departmentProgramsData]);

  // Create department structure with programs

  const {
    control,
    handleSubmit,
    formState: { errors, submitCount },
    watch,
    setValue
  } = useForm<ChooseProgramFormValues>({
    resolver: zodResolver(ChooseProgramSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      selectedDepartments: [],
      preferences: {}
    }
  });

  // Initialize department when departmentId and programs are available
  React.useEffect(() => {
    if (departmentId && departmentPrograms?.length > 0) {
      // Find the program that matches the current programId (using admission_program_id)
      const matchingProgram = departmentPrograms.find(
        (prog: { id: string; name: string }) => prog.id === admissionProgramId
      );
      const preferences =
        applicationDetailsData?.departments?.[0]?.preferences.map(
          (pref: { program: string; preference_order: string }) => ({
            program: pref.program,
            preference_order: pref.preference_order
          })
        ) || [];

      const department = {
        id: departmentId,
        name: applicationDetailsData?.departments?.[0]?.department?.name || '',
        process_fee: 1000, // Default processing fee
        programs: departmentPrograms,
        preferences
      };

      setProgramDepartment(department);

      // Set preferences based on application data or matching program
      if (applicationDetailsData?.departments?.[0]?.preferences?.length > 0) {
        // If application is already submitted, use preferences from applicationDetailsData
        const savedPreferences =
          applicationDetailsData.departments[0].preferences;

        // Create an array with 3 slots, mapping preferences by order
        const preferencesArray: string[] = ['', '', ''];

        savedPreferences.forEach(
          (pref: { program: string; preference_order: string }) => {
            const order = pref.preference_order;
            if (order === '1st' || order === '1') {
              preferencesArray[0] = pref.program;
            } else if (order === '2nd' || order === '2') {
              preferencesArray[1] = pref.program;
            } else if (order === '3rd' || order === '3') {
              preferencesArray[2] = pref.program;
            }
          }
        );

        setValue('selectedDepartments', [departmentId]);
        setValue(`preferences.${departmentId}`, preferencesArray);
      } else if (matchingProgram && programId) {
        // Fallback: If no saved preferences, set matching program as first preference
        setValue('selectedDepartments', [departmentId]);
        setValue(`preferences.${departmentId}`, [matchingProgram.id, '', '']);
      }
    }
  }, [
    departmentId,
    departmentPrograms,
    programId,
    admissionProgramId,
    setValue,
    applicationDetailsData
  ]);

  const selectedDepartments = watch('selectedDepartments');
  const allPreferences = watch('preferences');

  const [applyForProgram, { isLoading: isApplying }] =
    useApplyForProgramMutation();
  const [registerEvent, { isLoading: isRegistering }] =
    useRegisterEventMutation();

  const onSubmit = async (data: ChooseProgramFormValues) => {
    // Prevent submission if application is already submitted
    if (isApplicationDraft) {
      toast.warning(
        'Application has already been submitted. No changes can be made.'
      );
      if (applicationId) {
        dispatch(setApplicationId(applicationId));
      }
      onNext();
      return;
    }

    const preferences = data.preferences[departmentId || ''] || [];

    const preferences2 = preferences
      .filter((pref) => pref && pref !== '')
      .map((pref, index) => ({
        admission_program_id: pref,
        preference_order: index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'
      }));

    // const departments = data.selectedDepartments.map((deptId) => {
    // const preferences = (data.preferences[departmentId] || [])
    //   .filter((pref) => pref && pref !== '')
    //   .map((programId, index) => ({
    //     admission_program_id: programId,
    //     preference_order: index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'
    //   }));

    //   return {
    //     department: deptId,
    //     preferences
    //   };
    // });

    // const totalProcessingFee = programDepartment?.process_fee || 1000;

    const applicationData = {
      // program: programId,
      // campus_id: campusId,
      // applicant: userId,
      // admission: admissionId,
      // submission_date: new Date().toISOString(),
      preferences: preferences2,
      // total_processing_fee: totalProcessingFee,
      admission_program_id: admissionProgramId
    };

    try {
      await registerEvent({
        step: 'application/complete',
        universityId: universityId,
        admissionProgramId: admissionProgramId,
        programId: programId,
        eventType: 'navigate',
        campusId: campusId
      });
      const result = await applyForProgram(applicationData).unwrap();
      if (result?._id) {
        dispatch(setApplicationId(result?._id));
      }
      // toast.success('Application submitted successfully');
      onNext();
    } catch (error: unknown) {
      console.log('error of onSubmit', error);
      toast.error(
        (error as { data: { message: string } })?.data?.message ||
          'Error submitting application'
      );
    }
  };

  const filterAvailableOptions = (index: number, departmentId: string) => {
    const departmentPreferences = allPreferences[departmentId] || ['', '', ''];
    const selected = departmentPreferences.filter((_, i) => i !== index);
    // const department = filteredDepartments.find(
    //   (dept) => dept.id === departmentId
    // );

    return (
      programDepartment?.programs
        .map((program) => ({
          label: program.name,
          value: program.id
        }))
        .filter((program) => {
          // For first preference, include the program if it matches admissionProgramId
          if (index === 0 && program.value === admissionProgramId) {
            return true;
          }
          return !selected.includes(program.value);
        }) || []
    );
  };

  const renderPreferenceInput = (
    index: number,
    label: string,
    departmentId: string
  ) => (
    <Box sx={styles.preferenceContainer} key={index}>
      <Typography fontSize={18} width={50}>
        {index + 1}
        <Typography fontSize={14} component="sup">
          {label}
        </Typography>
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Controller
          name={`preferences.${departmentId}.${index}`}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <CustomInput
              displayEmpty
              placeholderLabel={
                index === 0
                  ? 'First Preference'
                  : 'Select Preference (Optional)'
              }
              type="select"
              value={field.value || ''}
              onChange={(value: string | MarksGPA) => field.onChange(value)}
              options={filterAvailableOptions(index, departmentId)}
              error={
                submitCount > 0 &&
                index === 0 &&
                selectedDepartments.includes(departmentId) &&
                !field.value
              }
              helperText={
                submitCount > 0 &&
                index === 0 &&
                selectedDepartments.includes(departmentId) &&
                !field.value
                  ? 'First preference is required'
                  : ''
              }
              disabled={isApplicationDraft || index === 0}
            />
          )}
        />
      </Box>
    </Box>
  );

  if (isLoadingPrograms || !userId || !departmentId) {
    return <ChooseProgramSkeleton />;
  }

  if (programsError) {
    return (
      <Box>
        <Typography color="error">
          Error loading programs. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <CustomTypography mt={4} fontSize={32} smallFont={18} fontWeight={600}>
        Choose Program
      </CustomTypography>
      <Typography variant="h6" fontWeight={500}>
        You are all set to apply for the admission now
      </Typography>
      <Typography variant="body2" fontSize={14} mb={4}>
        Note: Before applying for any program, please refer to the eligibility
        criteria to ensure that you are qualifying for the respective program.
      </Typography>

      {isApplicationDraft && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            bgcolor: '#FFF8E1',
            color: '#E65100',
            borderRadius: 2,
            border: '1px solid',
            borderColor: '#FFE0B2'
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            ⚠️ Application is in draft. Program Preferences cannot be updated in
            the draft version.
          </Typography>
        </Box>
      )}

      {/* {filteredDepartments?.map((department) => ( */}
      <Box key={programDepartment?.id} sx={styles.card} mt={2}>
        <Box sx={styles.programContainer}>
          <Typography variant="body1">
            Processing Fee: <strong>Rs {programDepartment?.process_fee}</strong>
          </Typography>
        </Box>

        <Collapse
          in={selectedDepartments.includes(programDepartment?.id || '')}
        >
          <Box p={4}>
            <Typography variant="body1" fontWeight={500} fontSize={14}>
              Program Preferences for {programDepartment?.name}
            </Typography>
            <Stack gap={2} mt={2}>
              {programDepartment?.programs?.length &&
              programDepartment?.programs?.length >= 3 ? (
                <>
                  {renderPreferenceInput(0, 'st', programDepartment?.id || '')}
                  {renderPreferenceInput(1, 'nd', programDepartment?.id || '')}
                  {renderPreferenceInput(2, 'rd', programDepartment?.id || '')}
                </>
              ) : (
                Array.from({
                  length: programDepartment?.programs.length || 0
                }).map((_, index) =>
                  renderPreferenceInput(
                    index,
                    index === 0 ? 'st' : index === 1 ? 'nd' : 'rd',
                    programDepartment?.id || ''
                  )
                )
              )}
            </Stack>
          </Box>
        </Collapse>
      </Box>
      {/* ))} */}

      {submitCount > 0 && errors.selectedDepartments && (
        <Typography color="error" mt={2}>
          {errors.selectedDepartments.message}
        </Typography>
      )}

      <Box mt={4}>
        <ButtonsComponent
          loading={isApplying || isRegistering}
          goToPrevStep={onPrev}
          disableSubmit={!isLoadingUser && !!userData && !isVerified}
          submitDisabledText="Verify email to continue"
          onVerifyEmailClick={
            !isVerified && onOpenVerificationModal
              ? onOpenVerificationModal
              : undefined
          }
        />
      </Box>
    </Box>
  );
};

const ChooseProgram = (props: {
  onPrev: () => void;
  onNext: () => void;
  isApplicationDraft: boolean;
  applicationId?: string;
  onOpenVerificationModal?: () => void;
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <div>Something went wrong. Please try again.</div>
      )}
    >
      <Suspense fallback={<ChooseProgramSkeleton />}>
        <ChooseProgramContent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default ChooseProgram;

const styles = {
  preferenceContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center'
  },
  card: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--Stroke, #E8ECF4);',
    borderRadius: '8px'
  },
  programContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 2
  }
};
