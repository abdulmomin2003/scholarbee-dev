'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  Menu,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { RootState } from '@/redux/store';
import {
  useGetUnreadMessagesCountQuery,
  useGetNotificationCountQuery
} from '@/redux/api/notificationsApi';
import { useGetUserQuery } from '@/redux/api/userApi';
import { COLORS } from '@/constants/colors';
import { getAuthStatus } from '@/utils/cookieManager';
import { classes } from './styles';
import NotificationPanel from './NotificationPanel';
import userContained from '@public/assets/svg/user-outlined.svg';

// --- Types ---

interface NavUserActionsProps {
  isCritical?: boolean;
  showMobileSignup?: boolean;
}

type UserDisplayFields = {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_image_url?: string;
  user_type?: string;
};

function resolveDisplayName(user: UserDisplayFields | null | undefined): string {
  if (!user) {
    return '';
  }
  const full = user.full_name?.trim();
  if (full) {
    return full;
  }
  const fromParts = [user.first_name, user.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  if (fromParts) {
    return fromParts;
  }
  return user.email?.split('@')[0] ?? '';
}

// --- Components ---

const UserProfileSkeleton = () => (
  <Stack direction="row" ml={2} alignItems="center">
    <Box
      sx={{
        height: 48,
        width: 48,
        border: `1px solid ${COLORS.borderColor}`,
        borderRadius: 2,
        mr: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Skeleton variant="circular" width={24} height={24} />
    </Box>
    <Stack direction="row" alignItems="center" sx={{ cursor: 'pointer' }}>
      <Skeleton variant="circular" width={48} height={48} />
      <Stack ml={1.5}>
        <Skeleton variant="text" width={120} height={24} />
        <Skeleton variant="text" width={180} height={16} />
      </Stack>
    </Stack>
  </Stack>
);

// --- Main Component ---

const NavUserActions = ({
  isCritical = true,
  showMobileSignup = false
}: NavUserActionsProps) => {
  const [openNotificationMenu, setOpenNotificationMenu] =
    useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const authUser = useSelector((state: RootState) => state.auth?.user);

  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Auth Verification Logic ---

  const verifyAuth = useCallback(() => {
    const status = getAuthStatus();
    const loggedIn =
      (status.hasToken && !status.isTokenExpired) ||
      (status.hasRefreshToken && !status.isRefreshTokenExpired);
    setIsLoggedIn(loggedIn);
    return status;
  }, []);

  useEffect(() => {
    setMounted(true);
    verifyAuth();

    // Re-verify on focus/visibility change to handle tab-idle expiry
    const handleReverify = () => verifyAuth();
    window.addEventListener('focus', handleReverify);
    window.addEventListener('visibilitychange', handleReverify);
    // Re-verify when any part of the app explicitly clears auth (e.g. session expiry)
    window.addEventListener('authLogout', handleReverify);

    // Set a timer to flip the state when the session is expected to fully expire
    let expiryTimer: NodeJS.Timeout;

    const getExpiry = (tokenName: string) => {
      try {
        const t = Cookies.get(tokenName);
        if (t && t.includes('.')) {
          const parts = t.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            return payload.exp ? payload.exp * 1000 - Date.now() : -1;
          }
        }
      } catch {
        // ignore
      }
      return -1;
    };

    if (isLoggedIn) {
      const accessExpiry = getExpiry('access_token');
      const refreshExpiry = getExpiry('refresh_token');

      // We want to flip the state to logged out only when ALL valid tokens expire.
      // So we wait for the longest valid expiry.
      const maxExpiry = Math.max(accessExpiry, refreshExpiry);

      if (maxExpiry > 0) {
        // Add a small buffer (1s) to ensure the server also sees it as expired
        expiryTimer = setTimeout(() => {
          verifyAuth();
        }, maxExpiry + 1000);
      }
    }

    return () => {
      window.removeEventListener('focus', handleReverify);
      window.removeEventListener('visibilitychange', handleReverify);
      window.removeEventListener('authLogout', handleReverify);
      if (expiryTimer) clearTimeout(expiryTimer);
    };
  }, [verifyAuth, pathname, isLoggedIn]);

  // --- API Queries ---

  /*
  const { data: notificationsData, isLoading: isLoadingNotifications } =
    useGetNotificationsQuery(
      { read_status: 'any', isCritical },
      { skip: !isLoggedIn }
    );
  */

  const { data: unreadMessagesCount } = useGetUnreadMessagesCountQuery(
    undefined,
    { skip: !isLoggedIn }
  );

  const { data: notificationCountData } = useGetNotificationCountQuery(
    undefined,
    { skip: !isLoggedIn }
  );

  const { data: userData, currentData: currentUserData } = useGetUserQuery(
    { isCritical },
    {
      skip: !isLoggedIn,
      refetchOnMountOrArgChange: false
    }
  );

  // --- Derived State ---

  const unreadConversationsCount = unreadMessagesCount?.count ?? 0;
  const unreadCount = notificationCountData?.count ?? 0;
  // const notificationsLoader = isLoadingNotifications && !notificationsData;

  const authUserForDisplay = useMemo((): UserDisplayFields | null => {
    if (!authUser) return null;
    const extended = authUser as UserDisplayFields;
    return {
      full_name: extended.full_name,
      first_name: authUser.first_name ?? '',
      last_name: authUser.last_name ?? '',
      email: authUser.email ?? '',
      profile_image_url: extended.profile_image_url,
      user_type: authUser.user_type,
    };
  }, [authUser]);

  const displayUserData =
    currentUserData || userData || authUserForDisplay || undefined;

  const displayName = useMemo(
    () => resolveDisplayName(displayUserData),
    [displayUserData],
  );

  // --- Event Handlers ---

  const handleCloseNotificationMenu = useCallback(() => {
    setOpenNotificationMenu(null);
  }, []);

  const handleOpenNotificationMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setOpenNotificationMenu(event.currentTarget);
    },
    []
  );

  // --- Render Helpers ---

  const renderUserProfile = () => {
    if (!mounted) return null;

    if (!displayUserData && isLoggedIn) {
      return <UserProfileSkeleton />;
    }
    if (!displayUserData || !isLoggedIn) return null;

    const isAdmin = displayUserData?.user_type === 'Super_Admin' || displayUserData?.user_type === 'Admin';

    return (
      <Stack direction="row" ml={2} alignItems="center">
        {/* ML Dashboard Icon for Admins */}
        {isAdmin && (
          <Link href="/admin/ml-dashboard" style={{ textDecoration: 'none' }} passHref>
            <Box
              sx={{
                ...classes.iconBox,
                mr: 1,
                backgroundColor: pathname === '/admin/ml-dashboard' ? COLORS.bgBlue : 'transparent'
              }}
            >
              <IconButton size="large" aria-label="ml dashboard" sx={{ borderRadius: 2 }}>
                <PsychologyIcon sx={{ color: pathname === '/admin/ml-dashboard' ? COLORS.primary : COLORS.textSecondary }} />
              </IconButton>
            </Box>
          </Link>
        )}

        {/* Chat Icon */}
        <Link href="/chat" style={{ textDecoration: 'none' }} passHref>
          <Box
            sx={{
              ...classes.iconBox,
              mr: 1,
              backgroundColor:
                pathname === '/chat' ? COLORS.bgBlue : 'transparent'
            }}
          >
            <IconButton
              size="large"
              aria-label="chat notifications"
              sx={{ borderRadius: 2 }}
            >
              <Badge badgeContent={unreadConversationsCount} color="error">
                <Image
                  height={24}
                  width={24}
                  alt="message"
                  src="/assets/svg/message.svg"
                />
              </Badge>
            </IconButton>
          </Box>
        </Link>

        {/* Notification Icon */}
        <Box sx={classes.iconBox}>
          <IconButton
            size="large"
            aria-label="notifications"
            onClick={handleOpenNotificationMenu}
            sx={{ borderRadius: 2 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Image
                height={24}
                width={24}
                alt="notification"
                src="/assets/svg/bell-outlined.svg"
              />
            </Badge>
          </IconButton>
          <Menu
            sx={(theme) => ({
              mt: { xs: 0, md: '40px' },
              '& .MuiPaper-root': {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                m: 0,
                '& .MuiList-root': { p: 0 },
                [theme.breakpoints.down('md')]: {
                  position: 'fixed !important',
                  top: '0 !important',
                  left: '0 !important',
                  width: '100vw !important',
                  height: '100vh !important',
                  maxWidth: '100vw !important',
                  maxHeight: '100vh !important',
                  margin: '0 !important',
                  borderRadius: '0 !important'
                }
              }
            })}
            id="notifications-menu"
            anchorEl={openNotificationMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(openNotificationMenu)}
            onClose={handleCloseNotificationMenu}
            disableScrollLock
          >
            <NotificationPanel onClose={handleCloseNotificationMenu} />
          </Menu>
        </Box>

        {/* Profile Avatar */}
        <Link
          href="/profile?tab=profileSummary"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            spacing={1.5}
          >
            <Avatar
              src={displayUserData?.profile_image_url}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: '#E8ECF4',
                display: { xs: 'none', md: 'flex' }
              }}
            >
              {!displayUserData?.profile_image_url && (
                <Image
                  src={userContained}
                  alt="avatar"
                  width={32}
                  height={32}
                />
              )}
            </Avatar>
            <Stack sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Typography color="primary" variant="body1" fontWeight={500}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {displayUserData.email}
              </Typography>
            </Stack>
          </Stack>
        </Link>
      </Stack>
    );
  };

  if (!mounted) return null;

  if (isLoggedIn) {
    return displayUserData ? renderUserProfile() : <UserProfileSkeleton />;
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Link href="/login" style={{ textDecoration: 'none' }} passHref>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="contained"
            sx={{
              ...classes.getStartedBtn,
              display: { xs: showMobileSignup ? 'block' : 'none', md: 'block' }
            }}
          >
            Login
          </Button>
        </motion.div>
      </Link>
    </Stack>
  );
};

export default NavUserActions;
