import { CustomTypography } from '@/components/atoms/customTypography';
import { COLORS } from '@/constants/colors';
import { formatLastChatTime, isDomainAllowed } from '@/utils/helperFunctions';
import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface Chat {
  active?: boolean;
  verified?: boolean;
  logoUrl: string;
  name: string;
  message: string;
  time: string;
  unreadCount?: number | boolean;
  id: string;
}

interface ContactItemProps extends Chat {
  onSelect: (chat: Chat) => void;
  isSelected?: boolean;
  isSupport?: boolean;
}

const ContactItem = ({
  active,
  verified,
  logoUrl,
  name,
  message,
  time,
  unreadCount,
  onSelect,
  id,
  isSupport,
  ...rest
}: ContactItemProps) => {
  // Get the conversationId from URL to highlight selected chat
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get('conversationId');

  // Check if this item is selected by URL or prop
  const isSelectedByUrl = urlConversationId === id;

  const handleClick = () => {
    onSelect({
      active,
      verified,
      logoUrl,
      name,
      message,
      time,
      unreadCount,
      id,
      ...rest
    });
  };

  return (
    <Stack
      onClick={handleClick}
      sx={{
        width: '100%',
        borderRadius: 1.5,
        p: 1,
        backgroundColor: isSelectedByUrl ? COLORS.bgBlue : 'white',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: isSelectedByUrl
            ? COLORS.bgBlue
            : 'rgba(64, 119, 255, 0.05)'
        }
      }}
      direction="row"
      spacing={1}
    >
      {/* Left side with avatar */}
      <Box
        sx={{
          flexShrink: 0,
          width: 58,
          height: 58,
          borderRadius: '50%',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.07)',
          overflow: 'hidden'
        }}
      >
        <Image
          src={
            logoUrl && isDomainAllowed(logoUrl)
              ? logoUrl
              : isSupport
                ? '/assets/svg/logo.svg'
                : '/assets/png/university_placeholder.png'
          }
          alt="university logo"
          width={58}
          height={58}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      {/* Middle content with text */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0, // This is important for text truncation
          overflow: 'hidden',
          mr: 1
        }}
      >
        <Stack spacing={0.5}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              fontSize={18}
              fontWeight={500}
              variant="body1"
              noWrap
              sx={{ maxWidth: '100%' }}
            >
              {name}
              {verified && (
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    display: 'inline-flex',
                    verticalAlign: 'middle'
                  }}
                >
                  <Image
                    src="/assets/svg/verified.svg"
                    alt="online"
                    width={16}
                    height={16}
                  />
                </Box>
              )}
            </Typography>
          </Box>
          <CustomTypography
            fontSize={16}
            variant="body2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word'
            }}
          >
            {message || 'No messages yet'}
          </CustomTypography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          height: '50px',
          flexShrink: 0,
          ml: 'auto'
        }}
      >
        <CustomTypography fontSize={12} variant="body2" whiteSpace={'nowrap'}>
          {formatLastChatTime(time)}
        </CustomTypography>
        {unreadCount && (
          <Box
            sx={{
              height: '12px',
              width: '12px',
              borderRadius: '50%',
              backgroundColor: COLORS.primary
            }}
          />
        )}
      </Box>
    </Stack>
  );
};
export default ContactItem;
