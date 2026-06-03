import React, { useMemo, useRef, useState } from 'react';
import { CustomTypography } from '@/components/atoms/customTypography';
import {
  Box,
  CircularProgress,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import Image from 'next/image';
import importGalleryIcon from '@public/assets/svg/gallery-import.svg';
import { DEPOSIT_DETAILS_FIELDS } from '../../constants';
import CustomInput from '../customInput';
import ButtonsComponent from '../buttonsComponent';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { UtilsApi } from '@/endpoints/utils';
import { useMakePaymentMutation } from '@/redux/api/applicationApi';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const depositDetailsSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  depositDate: z.string().min(1, 'Date of deposit is required'),
  depositAmount: z.string().min(1, 'Deposited amount is required'),
  branchAddress: z.string().min(1, 'Branch address is required'),
  feeInvoiceUrl: z.string().min(1, 'Deposit slip is required')
});

type DepositDetailsFormValues = z.infer<typeof depositDetailsSchema>;

const FinalSubmission = ({
  onNext,
  onPrev
}: {
  onNext: () => void;
  onPrev: () => void;
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<DepositDetailsFormValues>({
    resolver: zodResolver(depositDetailsSchema),
    defaultValues: {
      bankName: '',
      depositDate: '',
      depositAmount: '',
      branchAddress: '',
      feeInvoiceUrl: ''
    }
  });
  const [makePayment, { isLoading }] = useMakePaymentMutation();
  const { applicationId } = useSelector((state: RootState) => state.admission);

  console.log('error', errors);

  const onSubmit = async (data: DepositDetailsFormValues) => {
    console.log('Form Submitted:', data);
    try {
      const paymentData = {
        ...data,
        applicationId
      };
      const response = await makePayment(paymentData).unwrap();
      console.log('Payment successful:', response);
      toast.success(response.message);
      onNext();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <>
      <CustomTypography fontSize={32} smallFont={18} fontWeight={600}>
        Final Submission
      </CustomTypography>
      <Box>
        <Typography fontSize="500" my={2} variant="h6">
          For final submission of application form, provide the following
          details
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {DEPOSIT_DETAILS_FIELDS.map((field, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Controller
                  name={field.name as keyof DepositDetailsFormValues}
                  control={control}
                  render={({ field: inputField }) => (
                    <CustomInput
                      label={field.label}
                      type={field.type}
                      value={inputField.value}
                      onChange={inputField.onChange}
                      options={field.options || []}
                      required={field.required}
                      error={
                        !!errors[field.name as keyof DepositDetailsFormValues]
                      }
                      helperText={
                        errors[field.name as keyof DepositDetailsFormValues]
                          ?.message
                      }
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>

          <Controller
            name="feeInvoiceUrl"
            control={control}
            render={({ field }) => (
              <CustomFileInput
                label="Upload Deposit Slip"
                onChange={(fileUrl) => {
                  console.log('fileUrl', fileUrl);
                  field.onChange(fileUrl); // This updates the form state
                  setValue('feeInvoiceUrl', fileUrl); // This is redundant if field.onChange works correctly
                }}
                required
                // error={!!errors.feeInvoiceUrl}
                // helperText={errors.feeInvoiceUrl?.message}
                // placeholder="Drag-and-drop to upload Fee Invoice. Supported files: .png & .jpg"
                placeholder="upload Fee Invoice"
              />
            )}
          />
          {/* <Controller
            name="feeInvoiceUrl"
            control={control}
            render={({ field }) => (
              console.log('field', field),
              (
                <CustomFileInput
                  label="Upload Deposit Slip"
                  onChange={(fileUrl) => {
                    console.log('fileUrl', fileUrl);
                    setValue('feeInvoiceUrl', fileUrl);
                  }}
                  required
                  placeholder="Drag-and-drop to upload Fee Invoice. Supported files: .png & .jpg"
                />
              )
            )}
          /> */}

          <ButtonsComponent goToPrevStep={onPrev} loading={isLoading} />
        </Box>
      </Box>
    </>
  );
};

interface CustomFileInputProps {
  label: string;
  onChange: (fileUrl: string) => void;
  required?: boolean;
  placeholder?: string;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({
  label,
  onChange,
  required = false,
  placeholder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const token = Cookies.get('access_token');
  const utilsApi = useMemo(() => new UtilsApi(token || ''), [token]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setLoading(true);
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];

        // Validate file size (2MB limit)
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSizeInBytes) {
          toast.error('File size exceeds 2MB. Please upload a smaller file.');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        const response = await utilsApi.uploadMedia(formData);
        if (response?.success) {
          const imageUrl = `https://storage.googleapis.com/scholarbee-general-assets/${response?.data.doc.filename}`;
          onChange(imageUrl);
          setFileName(response?.data.doc.filename);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDropAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box sx={styles.container}>
      <Typography display="flex" variant="subtitle1" fontWeight="500">
        {label}
        {required && (
          <Typography component="span" color="error.main">
            *
          </Typography>
        )}
      </Typography>
      <TextField
        fullWidth
        type="file"
        inputRef={fileInputRef}
        onChange={handleFileChange}
        InputProps={{
          inputProps: {
            accept: 'image/png, image/jpeg'
          },
          style: {
            display: 'none'
          }
        }}
        sx={styles.textField}
      />
      <Box sx={styles.dropArea} onClick={handleDropAreaClick}>
        <Box display="flex" alignItems="center" flexDirection="column" gap={2}>
          {loading ? (
            <CircularProgress size={40} />
          ) : (
            <Image
              src={importGalleryIcon}
              alt="upload icon"
              width={40}
              height={40}
            />
          )}
          <Typography color="textSecondary" fontSize={14}>
            {loading ? 'Uploading...' : fileName || placeholder}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          marginTop: '4px',
          marginLeft: '4px',
          color: '#64748B',
          fontSize: '0.75rem'
        }}
      >
        Max file size: 2MB
      </Typography>
    </Box>
  );
};

const styles = {
  container: {
    width: '100%',
    mt: 2
  },
  dropArea: {
    border: '2px dashed #C4C4C4',
    borderRadius: '8px',
    backgroundColor: '#F8F8F8',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  textField: {
    position: 'relative',
    '& input': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'pointer'
    }
  }
};

export default FinalSubmission;
