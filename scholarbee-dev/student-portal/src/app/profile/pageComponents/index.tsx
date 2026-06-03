import {
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Stack
} from '@mui/material';
import { styles } from '../styles';

export const NavbarSkeleton = () => (
  <Box sx={{ bgcolor: 'white', p: 2 }}>
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Skeleton variant="rectangular" width={150} height={40} />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton width={100} height={24} />
      </Box>
    </Container>
  </Box>
);

export const SidebarSkeleton = () => (
  <Box sx={styles.sidebar}>
    <List>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <ListItem key={item} sx={styles.listItem}>
          <ListItemIcon sx={styles.icon}>
            <Skeleton variant="circular" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary={<Skeleton width={150} height={24} />} />
        </ListItem>
      ))}
    </List>
  </Box>
);

// Generic content skeleton with proper height
export const ContentSkeleton = () => (
  <Box sx={{ width: '100%', minHeight: '600px' }}>
    <Skeleton width={200} height={32} sx={{ mb: 3 }} />
    <Paper sx={styles.section}>
      <Box sx={styles.sectionHeader}>
        <Skeleton width={150} height={32} />
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        {[1, 2, 3, 4].map((item) => (
          <Box
            key={item}
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton height={24} width="60%" sx={{ mb: 1 }} />
              <Skeleton height={20} width="40%" />
            </Box>
            <Skeleton height={32} width={80} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    </Paper>
  </Box>
);

// Specific skeleton for profile summary page
export const ProfileSummarySkeleton = () => (
  <Box sx={{ width: '100%', minHeight: '800px' }}>
    {/* Programs & Applications section */}
    <Paper sx={{ ...styles.section, mb: 3 }}>
      <Box sx={styles.sectionHeader}>
        <Skeleton width={200} height={32} />
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[1, 2, 3].map((item) => (
            <Box key={item} sx={{ flex: '1 1 300px', minWidth: 250 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Skeleton
                  variant="circular"
                  width={60}
                  height={60}
                  sx={{ mx: 'auto', mb: 2 }}
                />
                <Skeleton height={24} width="80%" sx={{ mb: 1, mx: 'auto' }} />
                <Skeleton height={20} width="60%" sx={{ mx: 'auto' }} />
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>

    {/* Recent applications section */}
    <Paper sx={{ ...styles.section, mb: 3 }}>
      <Box sx={styles.sectionHeader}>
        <Skeleton width={180} height={32} />
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        {[1, 2, 3].map((item) => (
          <Box
            key={item}
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton height={24} width="70%" sx={{ mb: 1 }} />
              <Skeleton height={20} width="50%" />
            </Box>
            <Skeleton height={32} width={100} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    </Paper>
  </Box>
);

// Specific skeleton for applications/scholarships list
export const ApplicationsListSkeleton = () => (
  <Paper sx={{ ...styles.section, minHeight: '600px' }}>
    <Stack spacing={2} p={2}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Box
          key={item}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton height={24} width="80%" sx={{ mb: 1 }} />
            <Skeleton height={20} width="60%" sx={{ mb: 1 }} />
            <Skeleton height={18} width="40%" />
          </Box>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
          >
            <Skeleton height={32} width={100} sx={{ borderRadius: 1, mb: 1 }} />
            <Skeleton height={20} width="80px" />
          </Box>
        </Box>
      ))}
    </Stack>
  </Paper>
);

// Specific skeleton for profile information
export const ProfileInformationSkeleton = () => (
  <Stack spacing={2} sx={{ minHeight: '700px' }}>
    {/* Profile header */}
    <Paper
      sx={{
        ...styles.section,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
        <Box>
          <Skeleton height={28} width={200} sx={{ mb: 1 }} />
          <Skeleton height={20} width={150} />
        </Box>
      </Box>
      <Skeleton height={40} width={100} sx={{ borderRadius: 1 }} />
    </Paper>

    {/* Profile details */}
    <Paper sx={styles.section}>
      <Box sx={{ p: 3 }}>
        <Skeleton height={28} width={180} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Box key={item} sx={{ flex: '1 1 45%', mb: 2 }}>
              <Skeleton height={20} width={120} sx={{ mb: 1 }} />
              <Skeleton height={24} width="80%" />
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  </Stack>
);

// Specific skeleton for favorites
export const FavoritesSkeleton = () => (
  <Box sx={{ minHeight: '700px' }}>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Box
          key={item}
          sx={{ flex: '1 1 300px', minWidth: 280, maxWidth: 400 }}
        >
          <Paper sx={{ p: 2, height: 280 }}>
            <Skeleton height={120} sx={{ mb: 2, borderRadius: 1 }} />
            <Skeleton height={24} width="90%" sx={{ mb: 1 }} />
            <Skeleton height={20} width="70%" sx={{ mb: 1 }} />
            <Skeleton height={18} width="50%" sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Skeleton height={32} width={80} sx={{ borderRadius: 1 }} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </Paper>
        </Box>
      ))}
    </Box>
  </Box>
);

export const PageSkeleton = () => (
  <Box sx={styles.pageWrapper}>
    <NavbarSkeleton />
    <Box sx={styles.contentContainer}>
      <Box sx={styles.root}>
        <Container maxWidth="xl">
          <Box sx={styles.contentWrapper}>
            <SidebarSkeleton />
            <Box sx={styles.mainContent}>
              <ContentSkeleton />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  </Box>
);

export const ApplicationDetailsItemSkeleton = () => {
  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Skeleton height={24} width="60%" sx={{ mb: 1 }} />
        <Skeleton height={20} width="40%" />
      </Box>
      <Skeleton height={32} width={80} sx={{ borderRadius: 1 }} />
    </Box>
  );
};
