import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { TERMS_AND_CONDITIONS } from '../../constants';
import ButtonsComponent from '../buttonsComponent';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  useGetLegalDocumentRequirementsQuery,
  useUpdateApplicationSubmissionMutation
} from '@/redux/api/applicationApi';
import { toast } from 'react-toastify';
import { resetAdmissionState } from '@/redux/slices/admissionSlice';

const TermsAndConditions = ({ onPrev }: { onPrev: () => void }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [updateApplicationSubmission, { isLoading: isUpdating }] =
    useUpdateApplicationSubmissionMutation();
  const dispatch = useDispatch();
  const { data: allRequirements, isLoading: isLoadingReqDocs } =
    useGetLegalDocumentRequirementsQuery({});

  const applicationId = useSelector(
    (state: RootState) => state.admission.applicationId
  );

  console.log('applicationId', applicationId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateApplicationSubmission({
        applicationId,
        data: {
          is_submitted: true,
          accepted_legal_documents:
            allRequirements?.map((req: { _id: string }) => req?._id) || []
        }
      }).unwrap();

      dispatch(resetAdmissionState());

      setOpen(true);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        toast.error(
          (error.data as { message?: string })?.message ||
            'Something went wrong'
        );
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCheckStatus = () => {
    router.replace('/profile/applications');
    setOpen(false);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={mainStyles.container}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Terms and Conditions
        </Typography>
        {/* {TERMS_AND_CONDITIONS.map((section, index) => (
          <Box key={index} sx={mainStyles.section}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {section.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {section.content}
            </Typography>
          </Box>
        ))} */}
        {TERMS_AND_CONDITIONS.map((section, index) => (
          <Box key={index} sx={mainStyles.section}>
            <Typography variant="h6" fontWeight="bold" sx={mainStyles.title}>
              {section.title}
            </Typography>
            <Typography variant="body1" sx={mainStyles.content}>
              {section.content}
            </Typography>
          </Box>
        ))}
        <ButtonsComponent
          buttonTxt="Accept & Finish"
          goToPrevStep={onPrev}
          gotToHomeFunction={() => router.replace('/')}
          loading={isUpdating || isLoadingReqDocs}
        />
      </Box>
      <SuccessDialog
        open={open}
        onClose={handleClose}
        onCheckStatus={handleCheckStatus}
      />
    </>
  );
};

const SuccessDialog = ({
  open,
  onClose,
  onCheckStatus
}: {
  open: boolean;
  onClose: () => void;
  onCheckStatus: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="success-dialog-title"
      PaperProps={{ sx: styles.dialog }}
    >
      <DialogTitle sx={styles.dialogTitle}>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={styles.dialogContent}>
        <Box sx={styles.iconContainer}>
          <CheckCircleIcon sx={styles.checkIcon} />
        </Box>
        <Typography variant="h6" sx={styles.title}>
          Congratulations!
        </Typography>
        <Typography variant="body2" sx={styles.message}>
          You have successfully applied for the admission
        </Typography>
      </DialogContent>
      <DialogActions sx={styles.dialogActions}>
        <Button
          onClick={onCheckStatus}
          variant="contained"
          sx={styles.checkStatusButton}
        >
          Check Application Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mainStyles = {
  container: {
    px: 2,
    mt: 4,
    lineHeight: 1.6,
    maxWidth: '1000px',
    mx: 'auto'
  },
  section: {
    marginBottom: '20px'
  },
  title: {
    mb: 2
  },
  content: {
    whiteSpace: 'pre-line'
  }
};

const styles = {
  dialog: {
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%'
  },
  dialogTitle: {
    padding: 0,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  closeButton: {
    color: 'grey.500'
  },
  dialogContent: {
    padding: '16px 0'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)', // Light blue background
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    margin: '0 auto 16px'
  },
  checkIcon: {
    fontSize: '36px',
    color: 'primary.main'
  },
  title: {
    fontWeight: 600,
    color: 'primary.main',
    marginBottom: '8px'
  },
  message: {
    color: 'text.secondary',
    marginBottom: '16px'
  },
  dialogActions: {
    justifyContent: 'center',
    paddingBottom: '16px'
  },
  checkStatusButton: {
    backgroundColor: 'primary.main',
    color: 'white',
    '&:hover': {
      backgroundColor: 'primary.dark'
    },
    borderRadius: '8px',
    padding: '8px 24px'
  }
};

export default TermsAndConditions;
