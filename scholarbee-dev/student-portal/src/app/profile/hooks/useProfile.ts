'use client';
import { useState, useEffect, useRef } from 'react';
import { useGetUserApplicationsQuery } from '@/redux/api/applicationApi';
import { useGetUserScholarshipApplicationsQuery } from '@/redux/api/scholarshipApi';
import {
  useGetProgramApplicationsQuery,
  useGetScholarshipApplicationsQuery
} from '@/redux/api/analyticsApi';
import Cookies from 'js-cookie';
import { useGetUserConversationsQuery } from '@/redux/api/chatApi';
import { useNProgressNavigation } from '@/hooks/useNProgressNavigation';

export const useApplicationStatus = (statusFilters: string[] = []) => {
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  const { navigateWithProgress } = useNProgressNavigation();

  const queriesInitialized = useRef(false);

  useEffect(() => {
    setIsClient(true);
    setUserId(Cookies.get('userId'));
  }, []);

  // Create the query string with status filters
  const statusQueryString =
    statusFilters.length > 0
      ? `&${statusFilters.map((status) => `status[]=${status}`).join('&')}`
      : '';

  const queryString = userId ? `${userId}${statusQueryString}` : '';

  const {
    data: applicationsData,
    isLoading,
    isFetching,
    error
  } = useGetUserApplicationsQuery(queryString, {
    skip: !userId || !isClient,
    refetchOnMountOrArgChange: true
  });

  const firstQueryComplete = !!applicationsData || !!error;

  const {
    data: scholarshipsData,
    isLoading: isScholarshipLoading,
    error: scholarshipError
  } = useGetUserScholarshipApplicationsQuery(userId ?? '', {
    skip:
      !userId ||
      !isClient ||
      (!queriesInitialized.current && !firstQueryComplete),
    refetchOnMountOrArgChange: true
  });

  const secondQueryComplete = !!scholarshipsData || !!scholarshipError;

  const { data: conversations = [], isLoading: isLoadingConversations } =
    useGetUserConversationsQuery(undefined, {
      skip: !isClient || (!queriesInitialized.current && !secondQueryComplete)
    });

  // Analytics queries for stats
  const { data: programApplicationsStats, isLoading: isLoadingProgramStats } =
    useGetProgramApplicationsQuery(undefined, {
      skip: !isClient
    });

  const {
    data: scholarshipApplicationsStats,
    isLoading: isLoadingScholarshipStats
  } = useGetScholarshipApplicationsQuery(undefined, {
    skip: !isClient
  });

  useEffect(() => {
    if (isClient && !queriesInitialized.current) {
      queriesInitialized.current = true;
    }
  }, [isClient]);

  const handleViewAllApplications = () => {
    navigateWithProgress('/profile/applications');
  };

  const handleViewAllScholarships = () => {
    navigateWithProgress('/profile/scholarships');
  };

  const handleViewAllChats = () => {
    navigateWithProgress('/chat');
  };

  const handleViewAllFavoritesScholarships = () => {
    navigateWithProgress('/profile/favorite-scholarships');
  };

  const handleViewAllFavoritesPrograms = () => {
    navigateWithProgress('/profile/favorite-programs');
  };

  return {
    isClient,
    applicationsData,
    isLoading: isLoading || isFetching,
    error,
    scholarshipsData,
    isScholarshipLoading,
    scholarshipError,
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
  };
};
