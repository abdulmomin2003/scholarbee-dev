'use client';
import React from 'react';
import {
  useGetCampusesCountQuery,
  useGetAdmissionProgramsCountQuery,
  useGetScholarshipsCountQuery
} from '@/redux/api/statsApi';
import StatsSection from './StatsSection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatsDataFetcher = ({ styles }: any) => {
  // Fetch stats counts
  const { data: campusesCount } = useGetCampusesCountQuery();
  const { data: admissionProgramsCount } = useGetAdmissionProgramsCountQuery();
  const { data: scholarshipsCount } = useGetScholarshipsCountQuery();

  // Target values
  const targetStats = {
    campuses: campusesCount?.total_campuses_count ?? '0',
    programs: admissionProgramsCount?.total_admission_programs_count ?? '0',
    scholarships: scholarshipsCount?.total_scholarships_count ?? '0'
  };

  return (
    <StatsSection
      campuses={targetStats.campuses}
      programs={targetStats.programs}
      scholarships={targetStats.scholarships}
      styles={styles}
    />
  );
};

export default StatsDataFetcher;
