// import { CustomTypography } from '@/components/atoms/customTypography';
import { COLORS } from '@/constants/colors';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { isDomainAllowed } from '@/utils/helperFunctions';
interface ChatSectionHeaderProps {
  isLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedChat: any | null;
}

const ChatSectionHeader = ({
  isLoading,
  selectedChat
}: ChatSectionHeaderProps) => {
  return (
    <>
      {isLoading ? (
        <ChatSectionHeaderSkeleton />
      ) : (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1 }}>
          {selectedChat?.logoUrl || selectedChat?.campusLogo ? (
            <Box
              sx={{
                width: { xs: 48, md: 58 },
                height: { xs: 48, md: 58 },
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: selectedChat?.logoUrl ? '' : '1px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image
                src={
                  selectedChat?.logoUrl && isDomainAllowed(selectedChat.logoUrl)
                    ? selectedChat.logoUrl
                    : selectedChat?.campusLogo &&
                        isDomainAllowed(selectedChat.campusLogo)
                      ? selectedChat.campusLogo
                      : selectedChat.isSupport
                        ? '/assets/svg/logo.svg'
                        : '/assets/png/university_placeholder.png'
                }
                alt="university logo"
                width={58}
                height={58}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: { xs: 48, md: 58 },
                height: { xs: 48, md: 58 },
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image
                src="/assets/png/university_placeholder.png"
                alt="university logo placeholder"
                width={58}
                height={58}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
          <Stack sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction={'row'} spacing={1} alignItems="center">
              {selectedChat?.name ||
                (selectedChat?.campusName && (
                  <>
                    <Typography
                      fontWeight={500}
                      variant="body1"
                      sx={{
                        fontSize: { xs: '14px', md: '16px' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {selectedChat?.name || selectedChat?.campusName}
                    </Typography>
                  </>
                ))}
              {selectedChat?.verified ? (
                <Image
                  src="/assets/svg/verified.svg"
                  alt="online"
                  width={16}
                  height={16}
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <Box sx={{ height: '16px', width: '16px', flexShrink: 0 }} />
              )}
            </Stack>
            {/* {selectedChat?.online && (
              <CustomTypography fontSize={14} color="primary.main">
                Online
              </CustomTypography>
            )} */}
          </Stack>
        </Stack>
      )}
    </>
  );
};
export default ChatSectionHeader;

const ChatSectionHeaderSkeleton = () => {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1 }}>
      {/* University logo skeleton */}
      <Skeleton
        variant="circular"
        sx={{
          width: { xs: 48, md: 58 },
          height: { xs: 48, md: 58 },
          bgcolor: 'rgba(0, 0, 0, 0.1)',
          flexShrink: 0
        }}
      />

      <Stack sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* University name skeleton */}
          <Skeleton
            variant="text"
            sx={{
              width: { xs: 60, md: 80 },
              height: { xs: 20, md: 24 },
              flex: 1
            }}
          />

          {/* Verified icon skeleton */}
          <Skeleton
            variant="circular"
            sx={{
              width: 16,
              height: 16,
              bgcolor: `${COLORS.primary}30`,
              flexShrink: 0
            }}
          />
        </Stack>

        {/* Online status skeleton */}
        <Skeleton
          variant="text"
          sx={{
            width: { xs: 40, md: 50 },
            height: { xs: 16, md: 20 },
            bgcolor: `${COLORS.primary}20`
          }}
        />
      </Stack>
    </Stack>
  );
};
