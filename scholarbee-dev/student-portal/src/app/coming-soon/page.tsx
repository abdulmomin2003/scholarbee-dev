'use client';
import React from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  MenuItem,
  InputLabel,
  FormControlLabel,
  Switch,
  Select,
  TextField,
  FormHelperText,
  styled,
  Chip
} from '@mui/material';
import PhoneInput from 'react-phone-number-input';
import Image from 'next/image';
// import comingSoonCoverImage from '@public/assets/png/banner.jpg';
// import comingSoonCoverImage from '@public/assets/png/why-choose-scholarbee-2.jpg';
import logo from '@public/assets/svg/logo.svg';
import Title from '@/components/atoms/title';
import SnackbarNotification from '@/components/atoms/snackbarNotification';
import { styles } from './styles';
import 'react-phone-number-input/style.css';
import { Controller } from 'react-hook-form';
import useSubscribeForm from './useSubscribeForm';
import { CITIES } from '@/constants';
import UniversitySearchDropdown from '../(pageComponents)/universitiesSearchDropdown';
import Link from 'next/link';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
// import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const StyledPhoneInput = styled(Box)({
  '& .PhoneInput': {
    width: '100%',
    '& input': {
      width: '100%',
      height: '56px',
      padding: '8px 12px',
      fontSize: '16px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      '&:focus': {
        outline: 'none',
        borderColor: '#dee2e6'
      }
    },
    '& .PhoneInputCountry': {
      marginRight: '8px',
      marginLeft: '4px'
    }
  }
});

const ComingSoon: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    errors,
    onSubmit,
    openToast,
    toastMessage,
    severity,
    handleCloseToast,
    isLoading,
    userType,
    selectedCampuses,
    handleChange,
    handleDelete
  } = useSubscribeForm();

  return (
    <Grid
      container
      component="main"
      sx={{
        ...styles.mainContainer,
        // height: '100vh',
        // overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        py: 3
      }}
    >
      <Grid
        size={{ xs: 12, md: 5 }}
        component={Paper}
        elevation={6}
        square
        sx={{
          ...styles.rightGrid,
          // height: '100vh',
          mx: 'auto',
          // overflowY: 'auto',
          // msOverflowStyle: 'none',
          // scrollbarWidth: 'none',
          // '&::-webkit-scrollbar': {
          //   display: 'none'
          // },
          borderRadius: '18px'
        }}
      >
        <Box sx={styles.rightBox}>
          <Box sx={styles.innerBox}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Image src={logo} height={44} width={235} alt="logo" />
            </Link>

            <Box mt={6}>
              <Box mb={2} display={'flex'} justifyContent={'center'}>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={styles.comingSoonBadge}
                >
                  COMING SOON
                </Typography>
              </Box>
              <Title textAlign={'center'} title="Be the First to Know!" />
              <Typography
                textAlign={'center'}
                variant="body1"
                color="text.secondary"
                sx={styles.mainText}
              >
                {
                  "We're putting the finishing touches on our website and getting ready to launch. Sign up to receive updates, free consultations, and scholarship opportunities."
                }
              </Typography>
              <Box
                component="form"
                sx={styles.formContainer}
                onSubmit={handleSubmit(onSubmit)}
              >
                <TextField
                  variant="outlined"
                  label="Full Name"
                  fullWidth
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={styles.textField}
                />

                <TextField
                  label="Email Address"
                  fullWidth
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={styles.textField}
                />

                <FormControl fullWidth sx={styles.textField}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <StyledPhoneInput>
                        <PhoneInput
                          {...field}
                          placeholder="Phone Number"
                          defaultCountry="PK"
                          onChange={(value) => field.onChange(value)}
                          value={field.value}
                          international={false}
                        />
                      </StyledPhoneInput>
                    )}
                  />
                  {errors.phone && (
                    <FormHelperText error>
                      {errors.phone.message}
                    </FormHelperText>
                  )}
                </FormControl>

                {/* <FormControl fullWidth sx={styles.textField}>
                  <InputLabel>User Type</InputLabel>
                  <Controller
                    name="user_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="User Type"
                        value={field.value || ''}
                      >
                        <MenuItem value="Student">Student</MenuItem>
                        <MenuItem value="Admin">University Admin</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.user_type && (
                    <FormHelperText error>
                      {errors.user_type.message}
                    </FormHelperText>
                  )}
                </FormControl> */}

                {userType === 'Student' && (
                  <>
                    <FormControl fullWidth sx={styles.textField}>
                      <InputLabel>Seeking Admission In</InputLabel>
                      <Controller
                        name="study_level"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label="Seeking Admission In">
                            <MenuItem value="Bachelors">Bachelors</MenuItem>
                            <MenuItem value="Masters">Masters</MenuItem>
                            <MenuItem value="Phd">PhD</MenuItem>
                          </Select>
                        )}
                      />
                      {errors.study_level && (
                        <FormHelperText error>
                          {errors.study_level.message}
                        </FormHelperText>
                      )}
                    </FormControl>

                    <FormControl fullWidth sx={styles.textField}>
                      <InputLabel>Where do you want to study?</InputLabel>
                      <Controller
                        name="study_city"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Where do you want to study?"
                          >
                            {CITIES.map((city) => (
                              <MenuItem key={city.label} value={city.label}>
                                {city.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.study_city && (
                        <FormHelperText error>
                          {errors.study_city.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                    {selectedCampuses?.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {selectedCampuses?.map((campus) => (
                          <Chip
                            sx={{
                              m: 0.5,
                              maxWidth: '320px'
                            }}
                            key={campus.id}
                            label={campus.name}
                            onDelete={() => handleDelete(campus.id)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}

                    <UniversitySearchDropdown
                      disabled={isLoading || selectedCampuses?.length >= 3}
                      onCampusChange={handleChange}
                      url="campuses"
                      // onChange={handleChange}
                      variant="outlined"
                      title="Select three campuses you are interested in"
                      name="university"
                      fullWidth
                    />

                    <FormControl fullWidth sx={styles.textField}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography>Looking for Scholarship?</Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Controller
                            name="is_looking_for_scholarship"
                            control={control}
                            render={({ field }) => (
                              <>
                                <Typography
                                  variant="body2"
                                  color={
                                    !field.value
                                      ? 'primary.main'
                                      : 'text.secondary'
                                  }
                                >
                                  No
                                </Typography>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={field.value}
                                      onChange={field.onChange}
                                      color="primary"
                                      size="small"
                                    />
                                  }
                                  label=""
                                  sx={{ m: 0 }}
                                />
                                <Typography
                                  variant="body2"
                                  color={
                                    field.value
                                      ? 'primary.main'
                                      : 'text.secondary'
                                  }
                                >
                                  Yes
                                </Typography>
                              </>
                            )}
                          />
                        </Box>
                      </Box>
                    </FormControl>
                  </>
                )}

                <TextField
                  label="What are your thoughts?"
                  fullWidth
                  multiline
                  rows={4}
                  {...register('thoughts')}
                  sx={styles.textField}
                />
                <Button
                  variant="contained"
                  sx={styles.subscribeButton}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Register'}
                </Button>
              </Box>
            </Box>
            <Box
              sx={{ display: 'flex', gap: 3, justifyContent: 'flex-start' }}
              data-test-id="footer-social-links"
            >
              <Link
                href="https://www.facebook.com/profile.php?id=61565762532814"
                passHref
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon color="primary" />
              </Link>
              <Link
                href="https://www.instagram.com/scholarbee.ai/"
                passHref
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon color="primary" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/scholarbee/"
                passHref
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon color="primary" />
              </Link>
              {/* <Link
                href={
                  typeof window !== 'undefined' &&
                  /Mobi|Android/i.test(navigator.userAgent)
                    ? 'https://wa.me/923137665561'
                    : 'https://web.whatsapp.com/send?phone=923137665561'
                }
                passHref
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon color="primary" />
              </Link> */}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={styles.captionText}
            >
              Sign up for updates to be the first to know when we launch. No
              spam, just important information and exclusive offers.
            </Typography>
          </Box>
        </Box>
      </Grid>
      {/* <Grid
        size={{xs:false , sm:12, md: 5}}
        sx={{
          ...styles.leftGrid,
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden'
        }}
      >
        <Image
          src={comingSoonCoverImage}
          alt="circle bg image"
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
      </Grid> */}

      <SnackbarNotification
        open={openToast}
        message={toastMessage}
        severity={severity}
        onClose={handleCloseToast}
      />
    </Grid>
  );
};

export default ComingSoon;
