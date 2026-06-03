/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import ContactItem from './contactItem';
import { IChat } from '../types';
import { COLORS } from '@/constants/colors';
import SearchBox from './searchBox';

interface ContactsBodyProps {
  conversations: any[];
  isLoading?: boolean;
  onSelectChat: (chat: any) => void;
  selectedChat?: IChat | null;
  chatSearch: string;
  handleSearch: (value: string) => void;
}

const ContactsBody = ({
  conversations,
  isLoading,
  onSelectChat,
  selectedChat,
  chatSearch,
  handleSearch
}: ContactsBodyProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Box>
        {/* {conversations?.length !== 0 && ( */}
        <SearchBox chatSearch={chatSearch} handleSearch={handleSearch} />
        {/* )} */}
      </Box>
      {isLoading ? (
        <>
          <ContactItemSkeleton />
          <ContactItemSkeleton />
        </>
      ) : (
        <Box
          sx={{
            height: { md: '500px', sm: 'auto' },
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Box
            ref={scrollContainerRef}
            sx={{
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
              minHeight: 0,
              position: 'relative',
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a8a8a8'
              },
              scrollbarWidth: 'thin',
              scrollbarColor: '#c1c1c1 #f1f1f1'
            }}
          >
            {conversations?.length === 0 && (
              <Stack justifyContent="center" alignItems="center" height="100%">
                <Box
                  sx={{
                    color: COLORS.primary,
                    fontSize: '1.2rem',
                    fontWeight: 500
                  }}
                >
                  No Chats Found
                </Box>
              </Stack>
            )}
            <Stack spacing={2}>
              {conversations?.map((chat) => (
                <ContactItem
                  key={chat?.id}
                  id={chat?.id}
                  logoUrl={chat?.campusLogo}
                  name={chat?.campusName}
                  message={chat?.lastMessage}
                  time={chat?.lastMessageTime}
                  unreadCount={chat?.unread}
                  active={chat?.active}
                  verified={chat?.verified}
                  isSelected={selectedChat?.name === chat?.name}
                  onSelect={onSelectChat}
                  isSupport={chat?.isSupport}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ContactsBody;

const ContactItemSkeleton = () => {
  return (
    <Stack
      sx={{
        width: '100%',
        borderRadius: 1.5,
        p: 1,
        backgroundColor: 'white',
        cursor: 'default'
      }}
      direction="row"
      spacing={1}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Skeleton
          variant="circular"
          width={58}
          height={58}
          sx={{ bgcolor: 'rgba(0, 0, 0, 0.1)' }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          mr: 1
        }}
      >
        <Stack spacing={0.5}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="text" width="70%" height={28} />
          </Box>
          <Skeleton variant="text" width="90%" height={24} />
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
        <Skeleton variant="text" width={40} height={16} />

        <Skeleton
          variant="circular"
          width={20}
          height={20}
          sx={{
            mr: '0.5rem',
            mb: '0.5rem',
            bgcolor: `${COLORS.primary}40`
          }}
        />
      </Box>
    </Stack>
  );
};
