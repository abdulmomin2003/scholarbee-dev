'use client';
import Footer from '@/components/organisms/footer';
import Navbar from '@/components/organisms/navbar';
import { Box } from '@mui/material';
import React from 'react';
import { COLORS } from '@/constants/colors';
import BreadCrumbSection from '../pageComponents/breadCrumbSection';
import FiltersSection from './pageComponents/filtersSection';
import CampusesList from './pageComponents/campusesList';
import { useAddCampus } from './hooks/useFilters';

const AddCampus = () => {
  const {
    form,
    campuses,
    allCampuses,
    fetchingCampuses,
    campusSearchInput,
    handelCampusValueChange
  } = useAddCampus();

  const filterProps = {
    ...form,
    campuses,
    allCampuses,
    fetchingCampuses,
    campusSearchInput,
    handelCampusValueChange,
    selectedUniversity: form.watch('university'),
    selectedCampus: form.watch('campus'),
    dropdownKey: false,
    handleUniversityChange: (name: string, id: string) => {
      form.setValue('university', { id, name });
      form.setValue('campus', '');
      handelCampusValueChange('');
    }
  };

  return (
    <Box
      bgcolor={COLORS.bgColor}
      minHeight="100vh"
      display="flex"
      flexDirection="column"
    >
      <Navbar />
      <BreadCrumbSection customTitle="Add Chat" />
      <Box sx={styles.container}>
        <FiltersSection {...filterProps} />
        <CampusesList campuses={campuses} loading={fetchingCampuses} />
      </Box>
      <Footer />
    </Box>
  );
};

export default AddCampus;

const styles = {
  container: {
    flex: 1,
    py: 3,
    maxWidth: '1000px',
    mx: 'auto',
    width: '100%',
    px: { xs: 2, md: 3 }
  }
};
