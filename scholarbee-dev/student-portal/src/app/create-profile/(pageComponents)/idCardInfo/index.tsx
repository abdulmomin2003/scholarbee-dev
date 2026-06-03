'use client';
import React from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import ButtonsComponent from '../buttonsComponent';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomInput from '../customInput';
import { NationalIDCard as INationalIDCard } from '../../constants/types';
import useNationalIdCard from './useNationalIdCard';
import { nationalIdCardSchema } from '../../schemas';

interface NationalIDCardProps {
  onNext: () => void;
  onPrev: () => void;
}

const NationalIDCard: React.FC<NationalIDCardProps> = ({ onNext, onPrev }) => {
  const form = useForm<INationalIDCard>({
    resolver: zodResolver(nationalIdCardSchema),
    defaultValues: {
      front_side: '',
      back_side: ''
    }
  });

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = form;

  const { isLoadingUser, isUpdatingUser, onSubmit, isRegistering } =
    useNationalIdCard(form);

  const handleFormSubmit = (data: INationalIDCard) => {
    onSubmit(data, onNext);
  };

  return (
    <Box>
      <Typography fontSize="500" my={2} variant="h5">
        National ID Card
      </Typography>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        {isLoadingUser ? (
          <Box display={'flex'} justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={'front_side'}
                  control={control}
                  render={({ field: inputField }) => (
                    <CustomInput
                      required={true}
                      name={'front_side'}
                      label={'Front Side'}
                      type={'file'}
                      value={inputField.value}
                      onChange={inputField.onChange}
                      error={!!errors.front_side}
                      helperText={errors.front_side?.message || ''}
                      uniqueId="front-side-file"
                      placeholder="Upload front side"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={'back_side'}
                  control={control}
                  render={({ field: inputField }) => (
                    <CustomInput
                      required={true}
                      name={'back_side'}
                      label={'Back Side'}
                      type={'file'}
                      value={inputField.value}
                      onChange={inputField.onChange}
                      error={!!errors.back_side}
                      helperText={errors.back_side?.message || ''}
                      uniqueId="back-side-file"
                      placeholder="Upload back side"
                    />
                  )}
                />
              </Grid>
            </Grid>
            <ButtonsComponent
              goToPrevStep={onPrev}
              loading={isUpdatingUser || isRegistering}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default NationalIDCard;
