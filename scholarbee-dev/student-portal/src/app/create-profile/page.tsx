/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/organisms/navbar';
import { Box, Container, Typography } from '@mui/material';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import { COLORS } from '@/constants/colors';
import Footer from '@/components/organisms/footer';
import CustomizedProgressBars from '@/components/atoms/progressbar';
import PersonalInfo from './(pageComponents)/personalInfo';
import ContactInfo from './(pageComponents)/contactInfo';
import EducationInfo from './(pageComponents)/educationalInfo';
import NationalIDCard from './(pageComponents)/idCardInfo';
import ChooseProgram from './(pageComponents)/chooseProgram';
import TermsAndConditions from './(pageComponents)/termsAndConditions';
import { useCreateProfile } from './useCreateProfile';
import AllSetSection from './(pageComponents)/allSetSection';
import { useGetApplicationDetailsQuery } from '@/redux/api/applicationApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import EmailVerificationModal from '@/components/molecules/EmailVerificationModal';
import { clearApplicationId } from '@/redux/slices/admissionSlice';

/** Normalize API shape so draft checks match current Redux admission program. */
const getAdmissionProgramIdFromApplication = (
  application: { admission_program_id?: { _id?: string } | string } | undefined
): string | undefined => {
  if (!application?.admission_program_id) return undefined;
  const v = application.admission_program_id;
  return typeof v === 'object' && v !== null ? v._id : v;
};

const steps = [
  'Personal Information',
  'Contact Information',
  'Educational Background',
  'National ID Card',
  'Choose Program',
  'All Set Section',
  'Terms and Conditions'
];

const LoadingStep = ({ isLoadingUser }: { isLoadingUser?: boolean }) => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography>
      {isLoadingUser ? 'Loading user data...' : 'Loading step...'}
    </Typography>
  </Box>
);

const FormContentInner = ({
  currentStage,
  isLoading,
  applicationStatus,
  isVerified,
  onRequireVerification
}: {
  currentStage?: number;
  isLoading: boolean;
  applicationStatus: { isApplicationDraft: boolean; applicationId?: string };
  isVerified: boolean;
  onRequireVerification: () => void;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = Number(searchParams.get('step')) || 0;
  const isEditing = searchParams.get('editing') === 'true';

  React.useEffect(() => {
    if (isLoading) return;

    // Prevent unverified users from accessing the Choose Program step (step 4),
    // even if they try to jump via URL.
    if (!isVerified && currentStep >= 4) {
      const safeStep =
        currentStage !== undefined ? Math.min(currentStage, 4) : 4;
      router.replace(`/create-profile?step=${safeStep}`);
      return;
    }

    if (currentStep < 0 || currentStep >= steps.length || isNaN(currentStep)) {
      router.replace('/create-profile?step=0');
    } else if (currentStage === 4 && currentStep >= 5) {
      router.replace(`/create-profile?step=${currentStep}`);
      return;
    } else if (currentStage !== undefined && currentStep >= currentStage) {
      router.replace(`/create-profile?step=${currentStage}`);
    }
  }, [
    currentStage,
    currentStep,
    router,
    isLoading,
    applicationStatus.isApplicationDraft,
    isVerified
  ]);

  const handleNext = () => {
    if (isEditing) {
      // If editing from all set section, return to it
      router.push('/create-profile?step=5');
    } else {
      const nextStep = Math.min(currentStep + 1, steps?.length - 1);
      if (!isVerified && nextStep === 4) {
        onRequireVerification();
        return;
      }
      router.push(`/create-profile?step=${nextStep}`);
    }
  };

  const handlePrev = () => {
    if (isEditing) {
      // If editing from all set section, return to it
      router.push('/create-profile?step=5');
    } else {
      const prevStep = Math.max(currentStep - 1, 0);
      router.push(`/create-profile?step=${prevStep}`);
    }
  };

  const getToSection = (step: number) => {
    if (!isVerified && step === 4) {
      onRequireVerification();
      return;
    }
    router.push(`/create-profile?step=${step}&editing=true`);
  };

  const getProgress = () => {
    return (currentStep / 6) * 80 + 20;
  };

  return (
    <>
      <CustomizedBreadcrumbs />
      <Typography textAlign="right">{`${Math.round(getProgress())}%`}</Typography>
      <CustomizedProgressBars value={getProgress()} />

      <Suspense fallback={<LoadingStep />}>
        {currentStep === 0 && <PersonalInfo onNext={handleNext} />}
        {currentStep === 1 && (
          <ContactInfo onNext={handleNext} onPrev={handlePrev} />
        )}
        {currentStep === 2 && (
          <EducationInfo onNext={handleNext} onPrev={handlePrev} />
        )}
        {currentStep === 3 && (
          <NationalIDCard onNext={handleNext} onPrev={handlePrev} />
        )}
        {currentStep === 4 && (
          <ChooseProgram
            isApplicationDraft={applicationStatus?.isApplicationDraft}
            applicationId={applicationStatus?.applicationId}
            onNext={handleNext}
            onPrev={handlePrev}
            onOpenVerificationModal={onRequireVerification}
          />
        )}
        {currentStep === 5 && (
          <AllSetSection
            getToSection={getToSection}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
        {/* {currentStep === 5 && (
          <FeeInvoice onNext={handleNext} onPrev={handlePrev} />
        )} */}
        {/* {currentStep === 5 && (
          <FinalSubmission onNext={handleNext} onPrev={handlePrev} />
        )} */}
        {currentStep === 6 && <TermsAndConditions onPrev={handlePrev} />}
      </Suspense>
    </>
  );
};

const FormContent = ({
  currentStage,
  isLoading,
  applicationStatus,
  isVerified,
  onRequireVerification
}: {
  currentStage?: number;
  isLoading: boolean;
  applicationStatus: { isApplicationDraft: boolean; applicationId?: string };
  isVerified: boolean;
  onRequireVerification: () => void;
}) => {
  return (
    <Suspense fallback={<LoadingStep />}>
      <FormContentInner
        currentStage={currentStage}
        isLoading={isLoading}
        applicationStatus={applicationStatus}
        isVerified={isVerified}
        onRequireVerification={onRequireVerification}
      />
    </Suspense>
  );
};

const CreateProfile = () => {
  const dispatch = useDispatch();
  const { userData, isLoadingUser, isFetchingUser } = useCreateProfile();
  const currentStage = userData?.current_stage;
  const isVerified = userData?._verified;
  const shouldShowVerificationModal =
    !isLoadingUser && !isFetchingUser && !!userData && !isVerified;

  const [isVerificationModalOpen, setIsVerificationModalOpen] =
    React.useState(false);

  React.useEffect(() => {
    if (shouldShowVerificationModal) {
      setIsVerificationModalOpen(true);
    }
  }, [shouldShowVerificationModal]);

  const applicationId = useSelector(
    (state: RootState) => state.admission.applicationId
  );
  const admissionProgramId = useSelector(
    (state: RootState) => state.admission.admissionProgramId
  );

  const {
    data: applicationDetailsData,
    isLoading: isLoadingApplicationDetails
  } = useGetApplicationDetailsQuery(applicationId ?? '', {
    skip: !applicationId
  });

  const applicationStatus = React.useMemo(() => {
    if (!applicationDetailsData) {
      return {
        isApplicationDraft: false,
        applicationId: undefined as string | undefined
      };
    }
    const isDraft = applicationDetailsData.status?.toLowerCase() === 'draft';
    if (!isDraft) {
      return { isApplicationDraft: false, applicationId: undefined };
    }
    const applicationAdmissionProgramId = getAdmissionProgramIdFromApplication(
      applicationDetailsData
    );
    if (
      admissionProgramId &&
      applicationAdmissionProgramId &&
      applicationAdmissionProgramId !== admissionProgramId
    ) {
      return { isApplicationDraft: false, applicationId: undefined };
    }
    return {
      isApplicationDraft: true,
      applicationId: applicationDetailsData._id as string
    };
  }, [applicationDetailsData, admissionProgramId]);

  React.useEffect(() => {
    if (!applicationDetailsData || !applicationId) return;
    const applicationAdmissionProgramId = getAdmissionProgramIdFromApplication(
      applicationDetailsData
    );
    if (
      admissionProgramId &&
      applicationAdmissionProgramId &&
      applicationAdmissionProgramId !== admissionProgramId
    ) {
      dispatch(clearApplicationId());
    }
  }, [applicationDetailsData, admissionProgramId, applicationId, dispatch]);

  // const applicationStatus = applicationsData?.data?.reduce(
  //   (
  //     result: { isApplicationDraft: boolean; applicationId?: string },
  //     application: any
  //   ) => {
  //     if (
  //       application?.admission_program_id?._id === admissionProgramId &&
  //       application.status.toLowerCase() === 'draft'
  //     ) {
  //       return {
  //         isApplicationDraft: true,
  //         applicationId: application._id
  //       };
  //     }
  //     return result;
  //   },
  //   { isApplicationDraft: false, applicationId: undefined }
  // ) || { isApplicationDraft: false, applicationId: undefined };

  // const router = useRouter();

  // const admissionState = useSelector((state: RootState) => state.admission);
  // const { campusId, programId, admissionId, admissionProgramId } =
  //   admissionState;

  // React.useEffect(() => {
  //   if (isLoadingUser || isFetchingUser) return;

  //   const hasRequiredContext =
  //     campusId && programId && admissionId && admissionProgramId;

  //   if (!hasRequiredContext) {
  //     toast.error(
  //       'Please select a program through the "Apply for Admission" process before accessing this page.',
  //       { autoClose: 5000 }
  //     );

  //     router.replace('/programs');
  //   }
  // }, [
  //   campusId,
  //   programId,
  //   admissionId,
  //   admissionProgramId,
  //   isLoadingUser,
  //   isFetchingUser,
  //   router
  // ]);

  // if (
  //   !isLoadingUser &&
  //   !isFetchingUser &&
  //   (!campusId || !programId || !admissionId || !admissionProgramId)
  // ) {
  //   return null;
  // }

  return (
    <Box sx={{ bgcolor: COLORS.bgColor }}>
      <Navbar />
      <EmailVerificationModal
        open={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
      <Box sx={{ px: 2 }}>
        <Container sx={styles.container}>
          <FormContent
            currentStage={currentStage}
            isLoading={
              isLoadingUser || isFetchingUser || isLoadingApplicationDetails
            }
            applicationStatus={applicationStatus}
            isVerified={!!isVerified}
            onRequireVerification={() => setIsVerificationModalOpen(true)}
          />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    p: 2,
    my: 4,
    borderRadius: 2
  }
};

export default CreateProfile;
