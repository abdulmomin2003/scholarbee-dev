'use client';
import React from 'react';
import ProgramsAndApplications from './programsAndApplications';
import { useApplicationStatus } from './hooks/useProfile';
import { useFavorites } from './hooks/useFavorite';
import { ProfileSummarySkeleton } from './pageComponents';

const ProfileSummaryPage = () => {
  const {
    applicationsData,
    isLoading,
    scholarshipsData,
    isScholarshipLoading,
    conversations,
    isLoadingConversations,
    programApplicationsStats,
    scholarshipApplicationsStats,
    isLoadingProgramStats,
    isLoadingScholarshipStats,
    handleViewAllApplications,
    handleViewAllScholarships,
    handleViewAllChats,
    handleViewAllFavoritesScholarships,
    handleViewAllFavoritesPrograms
  } = useApplicationStatus();

  const {
    favoritesScholarships,
    isLoadingScholarships,
    allFavorites,
    isLoadingFavoritePrograms
  } = useFavorites();

  // Show skeleton while any critical data is loading
  if (isLoading || isScholarshipLoading || isLoadingConversations) {
    return <ProfileSummarySkeleton />;
  }

  return (
    <ProgramsAndApplications
      applications={applicationsData?.data ?? []}
      scholarships={scholarshipsData?.data ?? []}
      conversations={conversations ?? []}
      isLoadingConversations={isLoadingConversations}
      isLoadingApplications={isLoading}
      isLoadingScholarships={isScholarshipLoading}
      programApplicationsStats={programApplicationsStats?.data}
      scholarshipApplicationsStats={scholarshipApplicationsStats?.data}
      isLoadingProgramStats={isLoadingProgramStats}
      isLoadingScholarshipStats={isLoadingScholarshipStats}
      handleViewAllApplications={handleViewAllApplications}
      handleViewAllScholarships={handleViewAllScholarships}
      handleViewAllChats={handleViewAllChats}
      favoritePrograms={allFavorites}
      favoritesScholarships={favoritesScholarships}
      isLoadingFavoriteScholarships={isLoadingScholarships}
      handleViewAllFavoritesPrograms={handleViewAllFavoritesPrograms}
      handleViewAllFavoritesScholarships={handleViewAllFavoritesScholarships}
      isLoadingFavoritePrograms={isLoadingFavoritePrograms}
    />
  );
};

export default ProfileSummaryPage;
