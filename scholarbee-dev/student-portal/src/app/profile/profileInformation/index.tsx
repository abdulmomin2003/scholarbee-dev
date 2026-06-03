/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Grid,
  Paper,
  Typography,
  Skeleton,
  Stack,
  Button,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Image from 'next/image';
import { Controller } from 'react-hook-form';

import ImagePicker from '@/components/molecules/imagePicker';
import CustomInput from '@/app/create-profile/(pageComponents)/customInput';
import { styles } from './styles';
import { CONTACT_INFO_FIELDS, FieldType, PERSONAL_INFO } from './constants';
import { formatAdmissionDeadline } from '@/utils/helperFunctions';
import { useProfileInformation } from './useProfileInformation';

const ProfileInformation = () => {
  const {
    user,
    isLoadingUser,
    isUpdatingUser,
    isEditing,
    control,
    watch,
    handleSubmit,
    handleEditClick,
    handleCancelEdit,
    handleSaveProfile,
    handleImageUpload,
    handleImageUploadComplete,
    errors,
    getDistrictOptions,
    getCityOptions,
    isDirty
    // clearProfileImage
  } = useProfileInformation();

  const fullName = user?.full_name ?? '';

  const PERSONAL_INFO_FIELDS: FieldType[] = [
    ...PERSONAL_INFO,
    {
      name: 'districtOfDomicile',
      label: 'District of Domicile',
      type: 'select',
      options: getDistrictOptions(),
      required: true
    }
  ];

  // Dynamic contact info fields with city options based on selected state/province
  const DYNAMIC_CONTACT_INFO_FIELDS: FieldType[] = CONTACT_INFO_FIELDS.map(
    (field) => {
      if (field.name === 'city') {
        return {
          ...field,
          options: getCityOptions()
        };
      }
      return field;
    }
  );

  const PersonalInfoItem = ({
    label,
    value
  }: {
    label: string;
    value: string;
  }) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography
        fontWeight="600"
        sx={{ fontSize: { xs: '14px', sm: '15px' } }}
      >
        {label}
      </Typography>
      <Typography
        mt={0.75}
        fontWeight="400"
        variant="body2"
        sx={{ fontSize: { xs: '13px', sm: '14px' } }}
      >
        {isLoadingUser ? <Skeleton width={200} /> : value || '--'}
      </Typography>
    </Grid>
  );

  const personalInfoItems = [
    { label: 'Full Name', value: fullName },
    {
      label: 'Date Of Birth',
      value: user?.date_of_birth
        ? formatAdmissionDeadline(user.date_of_birth).formattedDate
        : '--'
    },
    { label: 'Gender', value: user?.gender || '--' },
    { label: 'Father Name', value: user?.father_name ?? '--' },
    { label: 'Domicile', value: user?.districtOfDomicile ?? '--' },
    {
      label: 'Nationality/ Country of Residence',
      value: user?.nationality ?? '--'
    }
  ];

  const contactInfoItems = [
    { label: 'Email Address', value: user?.email || '--' },
    { label: 'Phone Number', value: user?.phone_number || '--' },
    { label: 'State/Province', value: user?.stateOrProvince || '--' },
    { label: 'City', value: user?.city || '--' },
    { label: 'Postal/Zip Code', value: user?.postalCode || '--' },
    { label: 'Street Address', value: user?.streetAddress || '--' }
  ];

  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }}>
      <Paper sx={styles.section}>
        {isLoadingUser ? (
          <Skeleton variant="rectangular" width="100%" height={200} />
        ) : (
          <ImagePicker
            imageUrl={watch('profile_image_url') ?? ''}
            onImageUpload={handleImageUpload}
            onImageUploadComplete={handleImageUploadComplete}
            errorMessage={errors?.profile_image_url?.message}
          />
        )}
      </Paper>

      {isEditing ? (
        <Paper sx={styles.section} component="form">
          <Box sx={{ ...styles.infoSection, mb: { xs: 3, sm: 3.5 } }}>
            <Typography
              variant="h6"
              component="h2"
              fontWeight="600"
              sx={styles.subsectionTitle}
            >
              Personal Information
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              {PERSONAL_INFO_FIELDS.map((field: FieldType, index: number) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Controller
                    name={field.name as any}
                    control={control}
                    render={({ field: inputField }) => (
                      <CustomInput
                        label={field.label}
                        type={field.type}
                        value={inputField.value?.toString() || ''}
                        onChange={inputField.onChange}
                        options={field.options || []}
                        required={field.required}
                        error={!!errors[field.name as keyof typeof errors]}
                        helperText={
                          errors[field.name as keyof typeof errors]
                            ?.message as string
                        }
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ ...styles.infoSection, mb: { xs: 3, sm: 3.5 } }}>
            <Typography
              variant="h6"
              component="h2"
              fontWeight="600"
              sx={styles.subsectionTitle}
            >
              Contact Information
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              {DYNAMIC_CONTACT_INFO_FIELDS.map(
                (field: FieldType, index: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Controller
                      name={field.name as any}
                      control={control}
                      render={({ field: inputField }) => (
                        <CustomInput
                          label={field.label}
                          type={field.type}
                          value={inputField.value?.toString() || ''}
                          onChange={inputField.onChange}
                          options={field.options || []}
                          required={field.required}
                          error={!!errors[field.name as keyof typeof errors]}
                          helperText={
                            errors[field.name as keyof typeof errors]
                              ?.message as string
                          }
                          disabled={field.disabled}
                          displayEmpty={field.type === 'select'}
                          placeholder={
                            field.type === 'select'
                              ? `Select ${field.label}`
                              : undefined
                          }
                        />
                      )}
                    />
                  </Grid>
                )
              )}
            </Grid>
          </Box>
          <Box
            display="flex"
            gap={2}
            justifyContent="flex-end"
            flexDirection={{ xs: 'column', sm: 'row' }}
            mt={{ xs: 2, sm: 0 }}
            position={{ xs: 'sticky', sm: 'static' }}
            bottom={{ xs: 0, sm: 'auto' }}
            bgcolor={{ xs: 'white', sm: 'transparent' }}
            pt={{ xs: 2, sm: 0 }}
            pb={{ xs: 2, sm: 0 }}
            sx={{
              zIndex: { xs: 10, sm: 'auto' },
              boxShadow: { xs: '0px -2px 8px rgba(0, 0, 0, 0.1)', sm: 'none' }
            }}
          >
            <Button
              sx={{
                px: { xs: 3, sm: 4, md: 6 },
                width: { xs: '100%', sm: 'auto' }
              }}
              variant="outlined"
              color="primary"
              onClick={handleCancelEdit}
              disabled={isUpdatingUser}
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Image
                  src={'/assets/svg/group.svg'}
                  height={24}
                  width={24}
                  alt="edit_icon"
                  color="white"
                />
              }
              sx={{
                px: { xs: 3, sm: 4, md: 6 },
                width: { xs: '100%', sm: 'auto' }
              }}
              variant="contained"
              color="primary"
              onClick={handleSubmit((data) => handleSaveProfile(data))}
              disabled={isUpdatingUser || !isDirty}
            >
              {isUpdatingUser ? 'Updating...' : 'Update'}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper sx={styles.section}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: { xs: 2, sm: 2.5 }
            }}
          >
            <Typography variant="h6" sx={styles.subsectionTitle} mb={0}>
              Personal Information
            </Typography>
            <IconButton
              onClick={handleEditClick}
              aria-label="edit profile"
              sx={{
                backgroundColor: 'transparent',
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'primary.main',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Box>
          <Box>
            <Grid
              container
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{ mb: { xs: 3, sm: 3.5 } }}
            >
              {personalInfoItems.map((item, index) => (
                <PersonalInfoItem
                  key={index}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Grid>
          </Box>

          <Box sx={styles.infoSection}>
            <Typography variant="h6" sx={styles.subsectionTitle}>
              Contact Information
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {contactInfoItems.map((item, index) => (
                <PersonalInfoItem
                  key={index}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Grid>
          </Box>
        </Paper>
      )}
    </Stack>
  );
};

export default ProfileInformation;
