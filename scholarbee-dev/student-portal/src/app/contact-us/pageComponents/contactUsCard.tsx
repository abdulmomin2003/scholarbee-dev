import { ContactUs } from '@/types';
import { Box, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const ContactUsCard = ({
  focused,
  contact
}: {
  focused?: boolean;
  contact: ContactUs;
}) => {
  const isOpenChatButton = contact.buttonText === 'Open Chat';
  const isCallUsButton = contact.title === 'Call Us';
  const isEmailUsButton = contact.title === 'Email Us';

  const buttonContent = (
    <>
      {contact.buttonIcon && (
        <Image
          src={contact.buttonIcon}
          alt="Button Icon"
          height={16}
          width={16}
        />
      )}
      <Typography color="primary" ml={1} variant="body1">
        {contact.buttonText}
      </Typography>
    </>
  );

  return (
    <Paper
      sx={{
        display: 'flex',
        px: 3,
        py: 2,
        borderRadius: '12px',
        boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.05)',
        maxWidth: '340px',
        margin: '0 auto',
        backgroundColor: focused ? '#004ae0' : 'white'
      }}
    >
      <Box>
        <Typography variant="body1" {...(focused && { color: 'white' })}>
          {contact.title}
        </Typography>
        <Typography
          {...(focused && { color: 'white' })}
          fontSize={13}
          mt={2}
          variant="body1"
        >
          {contact.description}
        </Typography>
        {isOpenChatButton ? (
          <Link href="#contact-us-section" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                backgroundColor: focused ? 'white' : 'transparent',
                p: '11px 22px',
                borderRadius: '48px',
                border: '1px solid #004ae0',
                mt: 2,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                maxWidth: 'fit-content',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: focused ? '#f5f5f5' : '#f0f0f0'
                }
              }}
            >
              {buttonContent}
            </Box>
          </Link>
        ) : isCallUsButton ? (
          <a href="tel:+92 325 555 9699" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                backgroundColor: focused ? 'white' : 'transparent',
                p: '11px 22px',
                borderRadius: '48px',
                border: '1px solid #004ae0',
                mt: 2,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                maxWidth: 'fit-content',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: focused ? '#f5f5f5' : '#f0f0f0'
                }
              }}
            >
              {buttonContent}
            </Box>
          </a>
        ) : isEmailUsButton ? (
          <a
            href="mailto:info@scholarbee.pk"
            style={{ textDecoration: 'none' }}
          >
            <Box
              sx={{
                backgroundColor: focused ? 'white' : 'transparent',
                p: '11px 22px',
                borderRadius: '48px',
                border: '1px solid #004ae0',
                mt: 2,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                maxWidth: 'fit-content',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: focused ? '#f5f5f5' : '#f0f0f0'
                }
              }}
            >
              {buttonContent}
            </Box>
          </a>
        ) : (
          <Box
            sx={{
              backgroundColor: focused ? 'white' : 'transparent',
              p: '11px 22px',
              borderRadius: '48px',
              border: '1px solid #004ae0',
              mt: 2,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              maxWidth: 'fit-content'
            }}
          >
            {buttonContent}
          </Box>
        )}
      </Box>
      <Image src={contact.icon} alt="Call Us Icon" height={48} width={48} />
    </Paper>
  );
};

export default ContactUsCard;
