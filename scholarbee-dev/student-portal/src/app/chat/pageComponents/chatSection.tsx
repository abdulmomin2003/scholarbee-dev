import { Box, Container, Grid } from '@mui/material';
import { COLORS } from '@/constants/colors';
import ContactsHeading from './contactsHeading';
import ContactsBody from './contactBody';
import ChatSectionPlaceholder from './chatSectionPlaceholder';
import ChatSectionHeader from './chatSectionHeader';
import ChatSectionBody from './chatSectionBody';
import { useChats } from '../hooks/useChats';

const ChatSection = () => {
  const {
    conversations,
    selectedChat,
    setSelectedChat,
    isLoading,
    conversationMessages,
    isLoadingMessages,
    isFetching,
    handleSearch,
    chatSearch
  } = useChats();

  return (
    <Container sx={{ my: 3 }}>
      <Box sx={{ mb: 3, backgroundColor: COLORS.white, borderRadius: 2 }}>
        <Grid container p={3}>
          <Grid pr={3} size={{ xs: 12, md: 4.5 }}>
            <ContactsHeading conversations={conversations} />

            <ContactsBody
              chatSearch={chatSearch}
              handleSearch={handleSearch}
              onSelectChat={setSelectedChat}
              selectedChat={selectedChat}
              isLoading={isLoading}
              conversations={conversations}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 7.5 }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', md: '600px' },
              minHeight: { xs: 'auto', md: '600px' }
            }}
          >
            {!selectedChat && !isLoading ? (
              <ChatSectionPlaceholder />
            ) : (
              <>
                <ChatSectionHeader
                  isLoading={isLoading}
                  selectedChat={selectedChat}
                />
                <ChatSectionBody
                  conversationMessages={conversationMessages?.data}
                  isLoading={isLoading || isLoadingMessages || isFetching}
                  selectedChat={selectedChat}
                />
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ChatSection;
