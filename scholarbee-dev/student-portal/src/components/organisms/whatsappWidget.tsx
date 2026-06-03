// 'use client';
import React from 'react';
// import { Box, Fab, Paper, Typography, Zoom, IconButton } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import SendIcon from '@mui/icons-material/Send';
import Link from 'next/link';
import { Box, Fab } from '@mui/material';
import Image from 'next/image';
// interface WhatsAppWidgetProps {
//   phoneNumber?: string;
//   welcomeMessage?: string;
// }

// const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
//   phoneNumber = '923035686116',
//   welcomeMessage = 'Hello! How can we help you today?'
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [message, setMessage] = useState('');

//   const toggleWidget = () => {
//     setIsOpen((prev) => !prev);
//   };

//   const handleSendMessage = () => {
//     if (!message.trim()) return;

//     // Format the message for WhatsApp URL
//     const encodedMessage = encodeURIComponent(message);
//     // Open WhatsApp with the message
//     window.open(
//       `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
//       '_blank'
//     );

//     setMessage('');
//     setIsOpen(false);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <Box
//       sx={{
//         position: 'fixed',
//         bottom: '20px',
//         right: '20px',
//         zIndex: 1000,
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'flex-end'
//       }}
//     >
//       <Zoom in={isOpen}>
//         <Paper
//           elevation={3}
//           sx={{
//             width: { xs: '300px', sm: '350px' },
//             maxHeight: '450px',
//             borderRadius: '15px',
//             mb: 2,
//             overflow: 'hidden'
//           }}
//         >
//           <Box
//             sx={{
//               bgcolor: '#004ae0',
//               p: 2,
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center'
//             }}
//           >
//             <Box display="flex" alignItems="center">
//               <Box
//                 sx={{
//                   mr: 1,
//                   bgcolor: 'white',
//                   borderRadius: '50%',
//                   width: 40,
//                   height: 40,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//               >
//                 <WhatsAppIcon sx={{ color: 'white' }} />
//               </Box>
//               <Typography variant="h6" color="white">
//                 Chat with Us
//               </Typography>
//             </Box>
//             <IconButton
//               size="small"
//               onClick={toggleWidget}
//               sx={{ color: 'white' }}
//             >
//               <CloseIcon />
//             </IconButton>
//           </Box>

//           <Box sx={{ p: 2, bgcolor: '#f5f5f5', height: '250px' }}>
//             <Box
//               sx={{
//                 bgcolor: 'white',
//                 borderRadius: '10px',
//                 p: 2,
//                 maxWidth: '80%',
//                 boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
//               }}
//             >
//               <Typography variant="body1">{welcomeMessage}</Typography>
//             </Box>
//           </Box>

//           <Box
//             sx={{
//               p: 2,
//               bgcolor: 'white',
//               display: 'flex',
//               alignItems: 'center'
//             }}
//           >
//             <Box
//               component="textarea"
//               sx={{
//                 flex: 1,
//                 border: '1px solid #e0e0e0',
//                 borderRadius: '20px',
//                 p: 1.5,
//                 resize: 'none',
//                 fontFamily: 'inherit',
//                 fontSize: '14px',
//                 outline: 'none',
//                 '&:focus': {
//                   borderColor: '#004ae0'
//                 }
//               }}
//               placeholder="Type a message..."
//               rows={2}
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//             />
//             <IconButton
//               color="primary"
//               onClick={handleSendMessage}
//               disabled={!message.trim()}
//               sx={{ ml: 1 }}
//             >
//               <SendIcon />
//             </IconButton>
//           </Box>
//         </Paper>
//       </Zoom>

//       <Fab
//         color="primary"
//         aria-label="chat"
//         onClick={toggleWidget}
//         sx={{
//           width: 60,
//           height: 60,
// bgcolor: '#25D366',
// '&:hover': {
//   bgcolor: '#128C7E'
// }
//         }}
//       >
//         <WhatsAppIcon sx={{ color: 'white' }} />
//       </Fab>
//     </Box>
//   );
// };

const WhatsAppWidget = () => {
  return (
    <Box
      sx={{
        position: 'fixed',

        bottom: '20px',
        right: { xs: '16px', md: '20px' },
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      <Link
        href={
          typeof window !== 'undefined' &&
          /Mobi|Android/i.test(navigator.userAgent)
            ? 'https://wa.me/923255559699'
            : 'https://web.whatsapp.com/send?phone=923255559699'
        }
        passHref
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <Fab
          sx={{
            bgcolor: '#34C759',
            '&:hover': {
              bgcolor: '#2BA346'
            },
            color: 'white',
            px: { xs: 2.5, sm: 3 }
          }}
          variant="extended"
          size="medium"
        >
          <Box
            component="span"
            sx={{ display: { xs: 'none', sm: 'inline-block' } }}
          >
            CONTACT US
          </Box>
          <Box sx={{ ml: { xs: 0, sm: 1.25 }, display: 'flex' }}>
            <Image
              src={'/assets/svg/whatsapp.svg'}
              alt="whatsapp_icon"
              height={24}
              width={24}
            />
          </Box>
        </Fab>
      </Link>
    </Box>
  );
};

export default WhatsAppWidget;
