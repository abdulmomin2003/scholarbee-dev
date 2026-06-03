import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/constants/colors';
import {
  useLazyGetSupportCampusQuery,
  useGetUserConversationsQuery,
  useCreateConversationMutation
} from '@/redux/api/chatApi';
import { ChatConversation } from '@/types';

interface ContactsHeadingProps {
  conversations?: ChatConversation[];
}

const ContactsHeading = ({
  conversations: propConversations
}: ContactsHeadingProps) => {
  const router = useRouter();
  const [getSupportCampus, { isLoading: isLoadingSupport }] =
    useLazyGetSupportCampusQuery();
  const { data: fetchedConversations = [] } = useGetUserConversationsQuery();
  const [createConversation] = useCreateConversationMutation();

  const conversations = propConversations || fetchedConversations;

  const handleSupportClick = async () => {
    try {
      const supportCampusResult = await getSupportCampus().unwrap();
      const supportCampusId = supportCampusResult?._id;

      if (!supportCampusId) {
        console.error('Support campus ID not found');
        return;
      }

      const existingConversation = conversations.find(
        (conv: ChatConversation) => conv.campusId === supportCampusId
      );

      if (existingConversation) {
        router.push(`/chat?conversationId=${existingConversation.id}`);
      } else {
        const newChat = await createConversation(supportCampusId).unwrap();
        router.push(`/chat?conversationId=${newChat.id}`);
      }
    } catch (error) {
      console.error('Failed to get support campus:', error);
    }
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent={'space-between'}>
      <Stack
        spacing={2}
        direction="row"
        // onClick={handleBackClick}
      >
        {/* <ArrowBackIcon height={24} width={24} /> */}
        <Typography fontWeight={600} component="h1" variant="h5">
          Chat
        </Typography>
      </Stack>
      <Box display="flex" gap={2}>
        <Box
          onClick={handleSupportClick}
          sx={{
            height: '28px',
            width: '28px',
            borderRadius: '6px',
            backgroundColor: isLoadingSupport ? COLORS.primary : COLORS.white,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            cursor: isLoadingSupport ? 'not-allowed' : 'pointer',
            opacity: isLoadingSupport ? 0.6 : 1
          }}
        >
          {isLoadingSupport ? (
            <CircularProgress size={16} sx={{ color: COLORS.white }} />
          ) : (
            <Image
              src="/assets/svg/support.svg"
              alt="Support"
              width={28}
              height={28}
            />
          )}
        </Box>
        <Link
          href="/chat/add-campus"
          aria-label="Add campus to start new chat"
          style={{ display: 'flex' }}
        >
          <Box
            component="span"
            sx={{
              height: '28px',
              width: '28px',
              borderRadius: '6px',
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              cursor: 'pointer'
            }}
          >
            <AddIcon sx={{ fill: COLORS.white }} />
          </Box>
        </Link>
      </Box>
    </Stack>
  );
};
export default ContactsHeading;
