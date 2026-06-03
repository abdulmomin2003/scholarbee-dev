import React from 'react';
import Link from 'next/link';
import ConversationItem from './conversationItem';
import { Box, Stack, Typography } from '@mui/material';
import { styles } from '../styles';
import { ChatConversation } from '@/types';
import ConversationItemSkeleton from './conversationItemSkelton';
const ConversationWithUniversities = ({
  conversations,
  isLoadingConversations
  // handleViewAllChats
}: {
  conversations: ChatConversation[];
  isLoadingConversations: boolean;
  // handleViewAllChats: () => void;
}) => {
  const filteredConversations = conversations.filter(
    (conversation) => conversation?.campusName !== 'ScholarBee Support'
  );
  return (
    <Box sx={styles.savedSection}>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography mt={2} fontWeight={'600'} variant="h5">
          Conversation with Universities
        </Typography>
        {filteredConversations?.length > 0 && (
          <Link
            href="/chat"
            style={{
              fontWeight: 500,
              textDecoration: 'underline',
              color: 'inherit'
            }}
          >
            View All
          </Link>
        )}
      </Stack>

      {filteredConversations?.length === 0 ? (
        <Typography
          my={5}
          color="text.secondary"
          variant="body1"
          textAlign="center"
        >
          No Conversation Found
        </Typography>
      ) : (
        <Stack mt={3} pr={1} spacing={2} sx={styles.conversationStack}>
          {isLoadingConversations ? (
            <ConversationItemSkeleton />
          ) : (
            <>
              {filteredConversations.slice(0, 4).map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversationId={conversation.id}
                  universityName={conversation?.campusName}
                  messagePreview={conversation?.lastMessage}
                  logoSrc={conversation?.campusLogo}
                />
              ))}
            </>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ConversationWithUniversities;
