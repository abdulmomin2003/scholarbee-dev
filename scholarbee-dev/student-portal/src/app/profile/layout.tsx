'use client';
import React, { Suspense } from 'react';
import { Box, Container } from '@mui/material';
import Footer from '@/components/organisms/footer';
import Navbar from '@/components/organisms/navbar';
import { NavbarSkeleton, ContentSkeleton } from './pageComponents';
import { styles } from './styles';
import TokenRefreshCheck from './TokenRefreshCheck';
import Sidebar from './pageComponents/sidebar';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/hooks/useLogout';
import { useNProgressNavigation } from '@/hooks/useNProgressNavigation';
import Link from 'next/link';
import NProgress from 'nprogress';
import LogoutModal from './pageComponents/logoutModal';

export const dynamic = 'force-dynamic';

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { handleLogout, isLoggingOut } = useLogout();
  const { navigateWithProgress, isPending } = useNProgressNavigation();

  const handleLogoutWithFeedback = async () => {
    NProgress.start();
    try {
      await handleLogout();
    } finally {
      NProgress.done();
    }
  };

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname === '/profile' || pathname === '/profile/')
      return 'profileSummary';
    if (pathname.includes('/applications')) return 'applications';
    if (pathname.includes('/scholarships')) return 'scholarships';
    if (pathname.includes('/information')) return 'profile';
    if (pathname.includes('/favorite-programs')) return 'favoritePrograms';
    if (pathname.includes('/favorite-scholarships'))
      return 'favoriteScholarships';
    return 'profileSummary';
  };

  const activeTab = getActiveTab();

  const sidebarItems = [
    {
      icon: `/assets/svg/profile-summary${activeTab === 'profileSummary' ? '' : '-black'}.svg`,
      text: 'Programs & Applications',
      name: 'profileSummary',
      active: activeTab === 'profileSummary',
      onClick: () => navigateWithProgress('/profile')
    },
    {
      icon: `/assets/svg/application-status${activeTab === 'applications' ? '' : '-black'}.svg`,
      text: 'Application Status',
      name: 'applications',
      active: activeTab === 'applications',
      onClick: () => navigateWithProgress('/profile/applications')
    },
    {
      icon: `/assets/svg/application-status${activeTab === 'scholarships' ? '' : '-black'}.svg`,
      text: 'Scholarship Status',
      name: 'scholarships',
      active: activeTab === 'scholarships',
      onClick: () => navigateWithProgress('/profile/scholarships')
    },
    {
      icon: `/assets/svg/user-icon${activeTab === 'profile' ? '' : '-black'}.svg`,
      text: 'Profile Information',
      name: 'profile',
      active: activeTab === 'profile',
      onClick: () => navigateWithProgress('/profile/information')
    },
    {
      icon: `/assets/svg/favourite${activeTab === 'favoritePrograms' ? '' : '-black'}.svg`,
      text: 'Favorite Programs',
      name: 'favoritePrograms',
      active: activeTab === 'favoritePrograms',
      onClick: () => navigateWithProgress('/profile/favorite-programs')
    },
    {
      icon: `/assets/svg/favourite${activeTab === 'favoriteScholarships' ? '' : '-black'}.svg`,
      text: 'Favorite Scholarships',
      name: 'favoriteScholarships',
      active: activeTab === 'favoriteScholarships',
      onClick: () => navigateWithProgress('/profile/favorite-scholarships')
    },
    {
      icon: '/assets/svg/logout-black.svg',
      text: isLoggingOut ? 'Logging out...' : 'Logout',
      name: 'logout',
      active: false,
      onClick: handleLogoutWithFeedback,
      isLoading: isLoggingOut
    }
  ];

  return (
    <TokenRefreshCheck>
      {isLoggingOut && <LogoutModal />}

      <Link href="/profile" prefetch />
      <Link href="/profile/applications" prefetch />
      <Link href="/profile/scholarships" prefetch />
      <Link href="/profile/information" prefetch />
      <Link href="/profile/favorite-programs" prefetch />
      <Link href="/profile/favorite-scholarships" prefetch />

      <Box sx={styles.pageWrapper}>
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
        <Box sx={styles.contentContainer}>
          <Box sx={styles.root}>
            <Container maxWidth="xl">
              <Box sx={styles.contentWrapper}>
                <Sidebar items={sidebarItems} />
                <Box sx={styles.mainContent}>
                  <Suspense fallback={<ContentSkeleton />}>
                    {/* Show loading state during transitions */}
                    <Box sx={isPending ? styles.loadingContent : undefined}>
                      {children}
                    </Box>
                  </Suspense>
                </Box>
              </Box>
            </Container>
          </Box>
        </Box>
        <Footer />
      </Box>
    </TokenRefreshCheck>
  );
};

export default ProfileLayout;
