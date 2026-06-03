/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setAdmissionContextIds } from '@/redux/slices/admissionSlice';
import { useAuthRedirect } from '../useAuthRedirect';
import { useGetUserQuery } from '@/redux/api/userApi';
import ChatWithUniversity from './chatWithUniveristy';
import { useRegisterEventMutation } from '@/redux/api/analyticsApi';
import { toast } from 'react-toastify';
import { useSubmitExternalApplicationMutation } from '@/redux/api/externalApplication';
import { IsExternalApplicationAllowedResponse, useTrackRecommendationEventMutation } from '@/redux/api/programApi';

type BooleanLike = boolean | 'true' | 'false' | 'inherit' | null | undefined;

const parseBooleanLike = (value: BooleanLike): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const toDateOrNull = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getTodayStart = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const ApplyForAdmission = ({
  is_already_applied,
  was_redirected,
  c_id,
  programId,
  admissionId,
  disabled,
  receivingApplications,
  admissionStartDate,
  admissionEndDate,
  admissionProgramId,
  externalEligibility,
  isEligibilityLoading,
  universityId,
  departmentId
}: {
  is_already_applied: boolean;
  was_redirected: boolean;
  c_id: string;
  programId: string;
  admissionId: string;
  disabled: boolean;
  receivingApplications?: BooleanLike;
  admissionStartDate?: string;
  admissionEndDate?: string;
  admissionProgramId: string;
  externalEligibility?: IsExternalApplicationAllowedResponse;
  isEligibilityLoading?: boolean;
  universityId?: string;
  departmentId?: string;
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { handleProtectedAction } = useAuthRedirect();
  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();
  const [registerEvent, { isLoading: isRegistering }] =
    useRegisterEventMutation();
  const currentStage = userData?.current_stage;
  const [submitExternalApplication, { isLoading: isSubmitting }] =
    useSubmitExternalApplicationMutation();
  const [trackEvent] = useTrackRecommendationEventMutation();
  const today = getTodayStart();
  const startDate = toDateOrNull(admissionStartDate);
  const endDate = toDateOrNull(admissionEndDate);
  const isReceivingApplications = parseBooleanLike(receivingApplications);

  const hasStartDate = Boolean(startDate);
  const hasEndDate = Boolean(endDate);
  const isEndDateExpired = hasEndDate ? (endDate as Date) < today : false;
  const isOpeningSoon =
    isReceivingApplications === false &&
    hasStartDate &&
    (startDate as Date) >= today;
  const isNotAcceptingApplications =
    isReceivingApplications === false &&
    (!hasStartDate || (startDate as Date) < today);

  const isActionDisabled =
    disabled || isEndDateExpired || isOpeningSoon || isNotAcceptingApplications;

  const handleApplyForAdmission = useCallback(async () => {
    try {
      // Track ML apply event
      trackEvent({
        event_type: 'apply',
        resource_type: 'admission_program',
        resource_id: admissionProgramId,
        metadata: { applied_at: new Date().toISOString() }
      }).catch((err: any) => console.error('Failed to track apply event:', err));

      if (
        externalEligibility?.isExternalApplicationAllowed &&
        externalEligibility?.redirect_deeplink
      ) {
        await submitExternalApplication({
          admission_program: admissionProgramId,
          admission: admissionId,
          campus: c_id,
          program: programId,
          university: universityId
        }).unwrap();
        window.open(externalEligibility.redirect_deeplink, '_blank');
      } else {
        const response = await registerEvent({
          step: 'application/start',
          universityId: universityId,
          admissionProgramId: admissionProgramId,
          programId: programId,
          eventType: 'navigate',
          campusId: c_id
        });
        if (response?.data?.success) {
          dispatch(
            setAdmissionContextIds({
              campusId: c_id,
              programId,
              admissionId,
              admissionProgramId,
              universityId: universityId ?? null,
              departmentId: departmentId ?? null
            })
          );

          router.push(`/create-profile?step=${currentStage}`);
        } else {
          throw new Error('Failed to register event');
        }
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ?? error?.error ?? 'Error submitting application'
      );
    }
  }, [
    externalEligibility,
    submitExternalApplication,
    trackEvent,
    admissionProgramId,
    admissionId,
    c_id,
    programId,
    universityId,
    registerEvent,
    dispatch,
    router,
    currentStage,
    departmentId
  ]);

  return (
    <>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={2}
      >
        <Typography
          component="h2"
          variant="h5"
          fontWeight="600"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          About University
        </Typography>
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={2}
          width={{ xs: '100%', sm: 'auto' }}
          alignItems="center"
        >
          <Button
            fullWidth={false}
            sx={{
              cursor: isActionDisabled ? 'not-allowed' : 'pointer',
              backgroundColor: was_redirected ? '#7b1fa2' : undefined,
              '&:hover': {
                backgroundColor: was_redirected ? '#6a1b9a' : undefined
              },
              fontSize: { xs: '14px', sm: '16px', md: '18px' },
              fontWeight: 600,
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, sm: 1.5 },
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: 'none', sm: '200px' },
              whiteSpace: 'nowrap'
            }}
            variant="contained"
            disabled={
              isLoadingUser ||
              isActionDisabled ||
              isRegistering ||
              is_already_applied
            }
            onClick={() =>
              handleProtectedAction(
                handleApplyForAdmission,
                externalEligibility?.redirect_deeplink || '/create-profile'
              )
            }
          >
            {isLoadingUser ||
            isRegistering ||
            isSubmitting ||
            isEligibilityLoading ? (
              <LinearProgress
                sx={{ width: { xs: '100px', sm: '150px', md: '180px' } }}
              />
            ) : is_already_applied ? (
              'Already Applied'
            ) : (
              'Apply For Admission'
            )}
          </Button>
          <ChatWithUniversity campusId={c_id} />
        </Stack>
      </Box>
    </>
  );
};

export default ApplyForAdmission;
