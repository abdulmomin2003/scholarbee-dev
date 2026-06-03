import CustomInputField from '@/components/atoms/customInputField';
import { CustomTypography } from '@/components/atoms/customTypography';
import { COLORS } from '@/constants/colors';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import React from 'react';

const BecomePartnerForm = () => {
  return (
    <Box
      bgcolor={COLORS.bgColor}
      sx={{
        px: { xs: 2, sm: 6 },
        py: { xs: 5, sm: 8 },
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Paper
        sx={{
          boxShadow: 'none',
          borderRadius: 2,
          maxWidth: 1040,
          width: '100%',
          px: { xs: 2, sm: 4, md: 10 },
          py: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CustomTypography fontSize={32} smallFont={18} fontWeight={600}>
          Join Hands with ScholarBee
        </CustomTypography>
        <Typography mt={2} variant="h6" fontWeight={500}>
          Personal Information
        </Typography>
        <Grid sx={{ marginTop: '8px' }} spacing={2} container>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              labelText={'University/College/Institute'}
              placeholder="University Here"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              labelText={'Official Email'}
              placeholder="Email Here"
              required
              inputType="email"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              labelText={'Official Telephone'}
              placeholder="Telephone Number"
              required
              inputType="tel"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              required
              labelText={'Mobile Number'}
              placeholder="Mobile Number Here"
              inputType="tel"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              required
              labelText={'Country'}
              placeholder="Select Country"
              select
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              required
              labelText={'Province/State/Region'}
              placeholder="Sect Province/State/Region"
              select
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              required
              labelText="City"
              placeholder="Select City"
              select
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              required
              labelText="Address"
              placeholder="Address Here"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              required
              labelText="Postal Code"
              placeholder="Postal Code Here"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomInputField
              required
              labelText="Web Address"
              placeholder="Link Here"
              inputType="url"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomInputField
              required
              labelText="Office Location"
              placeholder="Location Here"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomInputField
              labelText="Further Information"
              placeholder="Type Here"
            />
          </Grid>
        </Grid>
        <Button
          sx={{
            marginTop: 2,
            px: 11,
            alignSelf: { xs: 'stretch', sm: 'center' },
            width: { xs: '100%', sm: 'auto' },
            maxWidth: '100%',
            '@media (min-width: 600px)': {
              maxWidth: 'fit-content'
            }
          }}
          fullWidth
          variant="contained"
        >
          Submit
        </Button>
      </Paper>
    </Box>
  );
};

export default BecomePartnerForm;
