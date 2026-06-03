'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Skeleton,
  SxProps,
  Theme,
  alpha,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { COLORS } from '@/constants/colors';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkNotificationsAsReadBulkMutation
} from '@/redux/api/notificationsApi';
import { useLazyGetProgramByIdQuery } from '@/redux/api/admissionProgramsApi';
import { buildAdmissionProgramDetailUrl } from '@/utils/helperFunctions';

// --- Types ---

interface NavigationItem {
  type: string;
  entityId: string;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  category: 'admission_program' | 'scholarship' | string;
  isRead: boolean;
  createdAt: string;
  navigation?: NavigationItem[];
  data?: {
    tags?: string[];
  };
  image_url?: string;
}

interface AdmissionProgramDetailsResponse {
  seo_title_key?: string;
  program_template_seo_title?: string;
  session_term?: string;
  session_year?: number | string;
  intake_year?: number | string;
  admission?: {
    session_term?: string;
    session_year?: number | string;
    campus?: {
      slug?: string;
      address?: {
        city?: string;
      };
      address_id?: {
        city?: string;
      };
    };
  };
}

interface NotificationPanelProps {
  onClose: () => void;
}

// --- Constants ---

const TABS = [
  { label: 'All', value: 'All' },
  { label: 'Admissions', value: 'admission_program' },
  { label: 'Scholarships', value: 'scholarship' }
] as const;

// --- Helper Functions ---

const getNavigationPath = (notification: NotificationItem): string => {
  const nav = notification.navigation?.[0];
  if (!nav) return '#';
  switch (nav.type) {
    case 'scholarship':
      return `/scholarship-details/${nav.entityId}`;
    default:
      return '#';
  }
};

// --- Main Component ---

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(
    []
  );
  const [hasMore, setHasMore] = useState(true);
  const [resolvingNotificationId, setResolvingNotificationId] = useState<
    string | null
  >(null);
  const [admissionNavigationPaths, setAdmissionNavigationPaths] = useState<
    Record<string, string>
  >({});

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markBulkAsRead] = useMarkNotificationsAsReadBulkMutation();
  const [getProgramById] = useLazyGetProgramByIdQuery();

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      read_status: 'any';
      category?: string[];
    } = {
      page,
      limit: 10,
      read_status: 'any'
    };
    if (activeTab !== 'All') {
      params.category = [activeTab];
    }
    return params;
  }, [activeTab, page]);

  const {
    data: notificationsData,
    isLoading,
    isFetching
  } = useGetNotificationsQuery(queryParams);

  // Handle data accumulation and category changes
  React.useEffect(() => {
    if (notificationsData?.data) {
      if (page === 1) {
        setAllNotifications(notificationsData.data);
      } else {
        setAllNotifications((prev) => {
          const newNotifications = notificationsData.data.filter(
            (newN: NotificationItem) =>
              !prev.some((oldN) => oldN._id === newN._id)
          );
          return [...prev, ...newNotifications];
        });
      }
      setHasMore(notificationsData.data.length === 10);
    }
  }, [notificationsData, page]);

  // Reset pagination on tab change
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    setPage(1);
    setAllNotifications([]);
    setHasMore(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (isAtBottom && hasMore && !isFetching && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.isRead).length;
  }, [allNotifications]);

  const handleMarkAsRead = useCallback(
    (id: string, isRead: boolean) => {
      if (!isRead) {
        markAsRead(id);
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    const unreadIds = allNotifications
      .filter((n) => !n.isRead)
      .map((n) => n._id);
    if (unreadIds.length > 0) {
      markBulkAsRead(unreadIds);
    }
  }, [allNotifications, markBulkAsRead]);

  const handleLinkClick = useCallback(
    (notificationId: string, isRead: boolean) => {
      handleMarkAsRead(notificationId, isRead);
      onClose();
    },
    [handleMarkAsRead, onClose]
  );

  const resolveAdmissionPath = useCallback(
    async (notification: NotificationItem) => {
      const nav = notification.navigation?.[0];
      if (!nav || nav.type !== 'admission_program') return null;

      setResolvingNotificationId(notification._id);

      try {
        const response = (await getProgramById(nav.entityId).unwrap()) as
          | AdmissionProgramDetailsResponse
          | undefined;

        const seoTitleKey = response?.program_template_seo_title;
        const sessionTerm = response?.admission?.session_term;
        const sessionYear = response?.admission?.session_year;
        const campusSlug = response?.admission?.campus?.slug;
        const city =
          response?.admission?.campus?.address?.city ||
          response?.admission?.campus?.address_id?.city;

        const resolvedPath = buildAdmissionProgramDetailUrl({
          seoTitleKey: seoTitleKey ?? '',
          city: city ?? '',
          campusSlug: campusSlug ?? '',
          sessionTerm: sessionTerm ?? '',
          sessionYear
        });

        if (resolvedPath) {
          setAdmissionNavigationPaths((prev) => ({
            ...prev,
            [notification._id]: resolvedPath
          }));
          return resolvedPath;
        }
      } catch (error) {
        console.error('Failed to resolve admission program details', error);
      } finally {
        setResolvingNotificationId(null);
      }

      // Fallback keeps current behavior if backend payload is incomplete.
      const fallbackPath = `/program-details/${nav.entityId}`;
      setAdmissionNavigationPaths((prev) => ({
        ...prev,
        [notification._id]: fallbackPath
      }));
      return fallbackPath;
    },
    [getProgramById]
  );

  React.useEffect(() => {
    const admissionNotificationsToResolve = allNotifications.filter(
      (notification) =>
        notification.navigation?.[0]?.type === 'admission_program' &&
        !admissionNavigationPaths[notification._id]
    );

    if (admissionNotificationsToResolve.length === 0) return;

    admissionNotificationsToResolve.forEach((notification) => {
      void resolveAdmissionPath(notification);
    });
  }, [admissionNavigationPaths, allNotifications, resolveAdmissionPath]);

  // Parse message titles inside useMemo for performance
  const parsedNotifications = useMemo(() => {
    return allNotifications.map((notification) => {
      const msg = notification.message;
      const programMatch = msg.match(/"([^"]+)"/g);
      let programTitle = notification.title;
      let universityName = 'Scholarbee';

      if (programMatch && programMatch.length >= 2) {
        programTitle = programMatch[0].replace(/"/g, '');
        universityName = programMatch[1].replace(/"/g, '');
      }

      return {
        ...notification,
        parsedProgramTitle: programTitle,
        parsedUniversityName: universityName
      };
    });
  }, [allNotifications]);

  return (
    <Box sx={styles.panelContainer}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        px={2.5}
        pt={2.5}
        pb={1.25}
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '18px',
              color: COLORS.textPrimary,
              whiteSpace: 'nowrap'
            }}
          >
            Notifications
          </Typography>
          {unreadCount > 0 && <Box sx={styles.unreadBadge}>{unreadCount}</Box>}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            onClick={handleMarkAllAsRead}
            sx={styles.markAllBtn}
            variant="text"
            size="small"
          >
            Mark All as Read
          </Button>

          <IconButton
            onClick={onClose}
            sx={{
              display: { xs: 'flex', md: 'none' },
              p: 0.5,
              color: COLORS.textPrimary,
              '&:hover': { backgroundColor: alpha(COLORS.primary, 0.05) }
            }}
          >
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={styles.tabContainer}>
        {TABS.map((tab) => {
          return (
            <Button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              sx={styles.tabButton(activeTab === tab.value)}
              size="small"
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>

      {/* Notification List */}
      <Box
        component="nav"
        sx={styles.listContainer}
        aria-label="notifications list"
        onScroll={handleScroll}
      >
        <AnimatePresence mode="wait">
          {isLoading || (isFetching && page === 1) ? (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box p={2}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={120}
                    sx={{ borderRadius: 2, mb: 2 }}
                  />
                ))}
              </Box>
            </motion.div>
          ) : parsedNotifications.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {parsedNotifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    delay: page === 1 ? index * 0.05 : 0, // Only stagger on first load
                    ease: 'easeOut'
                  }}
                >
                  <Box
                    onClick={() =>
                      handleMarkAsRead(notification._id, notification.isRead)
                    }
                    sx={styles.notificationCard(!notification.isRead)}
                  >
                    {!notification.isRead && <Box sx={styles.unreadDot} />}

                    {/* <Box sx={styles.logoContainer}>
                      <Image
                        src={
                          notification.image_url ||
                          '/assets/png/university_placeholder.png'
                        }
                        alt="Logo"
                        width={48}
                        height={48}
                        style={{ objectFit: 'contain' }}
                      />
                    </Box> */}

                    <Stack spacing={0.5} flex={1}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: COLORS.textPrimary
                        }}
                      >
                        {notification.parsedProgramTitle}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          fontSize: '12px',
                          color: COLORS.uniNameGray
                        }}
                      >
                        {notification.parsedUniversityName}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          fontSize: '12px',
                          color: COLORS.textSecondary,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {notification.message}
                      </Typography>

                      <Box mt={1.5}>
                        {notification.navigation?.[0]?.type ===
                        'admission_program' ? (
                          <Link
                            href={
                              admissionNavigationPaths[notification._id] || '#'
                            }
                            style={{ textDecoration: 'none' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!admissionNavigationPaths[notification._id]) {
                                e.preventDefault();
                                if (
                                  resolvingNotificationId !== notification._id
                                ) {
                                  void resolveAdmissionPath(notification);
                                }
                                return;
                              }
                              handleLinkClick(
                                notification._id,
                                notification.isRead
                              );
                            }}
                            passHref
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                              sx={{
                                color: COLORS.primary,
                                cursor:
                                  resolvingNotificationId === notification._id
                                    ? 'wait'
                                    : 'pointer',
                                '&:hover': { textDecoration: 'underline' },
                                opacity:
                                  resolvingNotificationId === notification._id
                                    ? 0.7
                                    : 1
                              }}
                            >
                              <Typography sx={{ fontSize: '14px' }}>
                                View Details
                              </Typography>
                              <ArrowForwardIcon sx={{ fontSize: 16 }} />
                            </Stack>
                          </Link>
                        ) : (
                          <Link
                            href={getNavigationPath(notification)}
                            style={{ textDecoration: 'none' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLinkClick(
                                notification._id,
                                notification.isRead
                              );
                            }}
                            passHref
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                              sx={{
                                color: COLORS.primary,
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              <Typography sx={{ fontSize: '14px' }}>
                                View Details
                              </Typography>
                              <ArrowForwardIcon sx={{ fontSize: 16 }} />
                            </Stack>
                          </Link>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                  {index < parsedNotifications.length - 1 && (
                    <Divider
                      sx={{ mx: 2.5, borderColor: COLORS.borderColor }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : !isFetching && !isLoading && allNotifications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Stack
                height="100%"
                justifyContent="center"
                alignItems="center"
                p={5}
              >
                <Typography variant="body2" color="textSecondary">
                  No notifications found
                </Typography>
              </Stack>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {isFetching && page > 1 ? (
          <Box
            display="flex"
            justifyContent="center"
            py={2}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CircularProgress size={24} thickness={4} />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

// --- Styles ---

const styles = {
  panelContainer: {
    width: { xs: '100vw', md: 420 },
    height: { xs: '100vh', md: 523 },
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: COLORS.white,
    border: { xs: 'none', md: `1px solid ${COLORS.borderColor}` },
    borderRadius: { xs: 0, md: '16px' },
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  unreadBadge: {
    backgroundColor: COLORS.statusClosed,
    borderRadius: '45px',
    minWidth: 20,
    height: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: COLORS.white,
    fontSize: '11px',
    fontWeight: 600,
    px: 1,
    lineHeight: 1
  },
  markAllBtn: {
    fontWeight: 400,
    fontSize: '14px',
    color: COLORS.primary,
    textTransform: 'none',
    padding: 0,
    minWidth: 'auto',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline'
    },
    '&.Mui-disabled': {
      color: alpha(COLORS.lightGray, 0.5)
    }
  },
  tabContainer: {
    display: 'flex',
    gap: 1,
    px: 2.5,
    pt: 1.25,
    pb: 1.5,
    borderBottom: `1px solid ${COLORS.borderColor}`
  },
  tabButton: (isActive: boolean): SxProps<Theme> => ({
    padding: '7px 16px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: isActive ? 500 : 400,
    textTransform: 'none',
    minWidth: 'auto',
    backgroundColor: isActive ? '#25272A' : '#F2F2F3',
    color: isActive ? COLORS.white : '#4A5565',
    '&:hover': {
      backgroundColor: isActive ? '#25272A' : COLORS.borderColor
    }
  }),
  listContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    '&::-webkit-scrollbar': { width: 6 },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: COLORS.borderColor,
      borderRadius: 10
    }
  },
  notificationCard: (isUnread: boolean): SxProps<Theme> => ({
    display: 'flex',
    padding: '16px 20px',
    gap: '12px',
    cursor: 'pointer',
    backgroundColor: isUnread ? COLORS.applicationItemBg : COLORS.white,
    position: 'relative',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: COLORS.applicationItemBg
    }
  }),
  unreadDot: {
    position: 'absolute',
    left: 6,
    top: '50%',
    translate: '0 -50%',
    width: 8,
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: '50%'
  },
  logoContainer: {
    width: 48,
    height: 48,
    border: `1px solid ${COLORS.borderColor}`,
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: COLORS.white,
    overflow: 'hidden'
  },
  tag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2px 5px',
    borderRadius: '4px',
    fontSize: '11px',
    lineHeight: '14px',
    letterSpacing: '-0.2px',
    color: COLORS.white,
    height: '18px',
    boxSizing: 'border-box'
  } as SxProps<Theme>
};
