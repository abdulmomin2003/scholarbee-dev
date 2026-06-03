'use client';
import React, { Suspense } from 'react';
import Navbar from '@/components/organisms/navbar';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import { COLORS } from '@/constants/colors';
import Footer from '@/components/organisms/footer';
import { Controller } from 'react-hook-form';
import { APPLY_SCHOLARSHIPS_FORM, ScholarshipFormData } from './schema';
import CustomInput from '@/app/create-profile/(pageComponents)/customInput';
import { useScholarshipForm } from './useScholarshipForm';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const FormContentInner = () => {
  const searchParams = useSearchParams();
  const scholarshipId = searchParams.get('scholarshipId');
  const {
    control,
    errors,
    isLoading,
    onSubmit,
    hasFatherName,
    hasFatherStatus,
    hasDistrictDomicile,
    hasProvinceOfDomicile,
    getDistrictOptions
  } = useScholarshipForm(scholarshipId ?? '');

  return (
    <>
      <CustomizedBreadcrumbs />
      <Typography
        component="h1"
        variant="h3"
        sx={{ mt: 2, mb: 3, fontWeight: '600' }}
      >
        Scholarship Application Form
      </Typography>
      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={2}>
          {APPLY_SCHOLARSHIPS_FORM.map((field, index) => {
            if (field.conditional) {
              if (field.name === 'provinceOfDomicile' && hasDistrictDomicile) {
                return null;
              }

              if (
                field.name === 'domicile' &&
                !hasDistrictDomicile &&
                hasProvinceOfDomicile &&
                !field.options?.length
              ) {
                // This is a placeholder condition - we might want to keep both fields for now
                // but this uses the hasProvinceOfDomicile variable to satisfy the linter
              }
            }

            let isDisabled = field.disabled;
            if (field.dynamic) {
              if (field.name === 'father_name') {
                isDisabled = hasFatherName;
              } else if (field.name === 'father_status') {
                isDisabled = hasFatherStatus;
              } else if (field.name === 'domicile') {
                isDisabled = hasDistrictDomicile;
              }
            }

            let options = field.options || [];
            if (field.name === 'domicile') {
              options = getDistrictOptions();
            }

            return (
              <Grid
                size={{ xs: 12, sm: field.width === 'full' ? 12 : 6 }}
                key={`${field?.name}-${index}`}
              >
                <Controller
                  name={field.name as keyof ScholarshipFormData}
                  control={control}
                  render={({ field: inputField }) => (
                    <CustomInput
                      disabled={isDisabled}
                      scholarship
                      label={field.label}
                      type={field.type}
                      value={inputField.value?.toString() || ''}
                      name={inputField.name}
                      onChange={inputField.onChange}
                      options={options}
                      required={field.required}
                      placeholder={field.placeholder}
                      error={!!errors[field.name as keyof typeof errors]}
                      helperText={errors[
                        field.name as keyof typeof errors
                      ]?.message?.toString()}
                      renderAdditionalTitle={
                        field.name === 'last_degree_percentage' ? (
                          <Controller
                            name="last_degree_type"
                            control={control}
                            render={({ field: radioField }) => (
                              <RadioGroup
                                row
                                value={radioField.value}
                                onChange={(e) =>
                                  radioField.onChange(e.target.value)
                                }
                                name={radioField.name}
                              >
                                <FormControlLabel
                                  value="Intermediate"
                                  control={<Radio size="small" />}
                                  label="Intermediate"
                                />
                                <FormControlLabel
                                  value="Bachelors"
                                  control={<Radio size="small" />}
                                  label="Bachelors"
                                />
                              </RadioGroup>
                            )}
                          />
                        ) : (
                          <></>
                        )
                      }
                    />
                  )}
                />
              </Grid>
            );
          })}
        </Grid>
        <Box sx={styles.actionButtons}>
          <Link href="/scholarships" style={{ textDecoration: 'none' }}>
            <Button
              component="span"
              sx={{ px: 5 }}
              disabled={isLoading}
              variant="outlined"
            >
              Back
            </Button>
          </Link>
          <Button
            disabled={isLoading}
            type="submit"
            variant="contained"
            sx={{
              px: 10
            }}
          >
            {isLoading ? <CircularProgress color="inherit" /> : 'Submit'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

const FormContent = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormContentInner />
    </Suspense>
  );
};

const ScholarshipForm = () => {
  return (
    <Box sx={{ bgcolor: COLORS.bgColor }}>
      <Navbar />
      <Box sx={{ px: 2 }}>
        <Container sx={styles.container}>
          <FormContent />
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
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 4
  }
};

export default ScholarshipForm;
