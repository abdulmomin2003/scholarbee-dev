/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Grid } from '@mui/material';
import ConversationWithUniversities from './components/conversationWithUniversities';
import SavedPrograms from './components/savedPrograms';
import ApplicationStatus from './components/applicationStatus';
import ProfileSummary from './components/profileSummary';
import { ChatConversation } from '@/types';
import { Scholarship } from '@/types/scholarship';

const ProgramsAndApplications = ({
  applications,
  scholarships,
  conversations,
  isLoadingConversations,
  isLoadingApplications,
  isLoadingScholarships,
  programApplicationsStats,
  scholarshipApplicationsStats,
  isLoadingProgramStats,
  isLoadingScholarshipStats,
  handleViewAllApplications,
  handleViewAllScholarships,
  handleViewAllChats,
  favoritesScholarships,
  isLoadingFavoriteScholarships,
  handleViewAllFavoritesScholarships,
  handleViewAllFavoritesPrograms,
  favoritePrograms,
  isLoadingFavoritePrograms
}: {
  applications: any;
  scholarships: Scholarship[];
  conversations: ChatConversation[];
  isLoadingConversations: boolean;
  isLoadingApplications: boolean;
  isLoadingScholarships: boolean;
  programApplicationsStats?: any;
  scholarshipApplicationsStats?: any;
  isLoadingProgramStats: boolean;
  isLoadingScholarshipStats: boolean;
  handleViewAllApplications: () => void;
  handleViewAllScholarships: () => void;
  handleViewAllChats: () => void;
  favoritesScholarships: Scholarship[];
  isLoadingFavoriteScholarships: boolean;
  handleViewAllFavoritesScholarships: () => void;
  handleViewAllFavoritesPrograms: () => void;
  favoritePrograms: any;
  isLoadingFavoritePrograms: boolean;
}) => {
  return (
    <>
      <ProfileSummary
        programApplicationsStats={programApplicationsStats}
        scholarshipApplicationsStats={scholarshipApplicationsStats}
        isLoadingProgramStats={isLoadingProgramStats}
        isLoadingScholarshipStats={isLoadingScholarshipStats}
        onApplicationsClick={handleViewAllApplications}
        // onScholarshipsClick={handleViewAllScholarships}
      />
      <ApplicationStatus
        applications={applications}
        scholarships={scholarships}
        isLoadingApplications={isLoadingApplications}
        isLoadingScholarships={isLoadingScholarships}
        // handleViewAllApplications={handleViewAllApplications}
        // handleViewAllScholarships={handleViewAllScholarships}
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <SavedPrograms
            type="Programs"
            allFavorites={favoritePrograms}
            isLoading={isLoadingFavoritePrograms}
            // handleViewAllFavorites={handleViewAllFavoritesPrograms}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SavedPrograms
            type="Scholarships"
            allFavorites={favoritesScholarships}
            isLoading={isLoadingFavoriteScholarships}
            // handleViewAllFavorites={handleViewAllFavoritesScholarships}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ConversationWithUniversities
            // handleViewAllChats={handleViewAllChats}
            conversations={conversations}
            isLoadingConversations={isLoadingConversations}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ProgramsAndApplications;
