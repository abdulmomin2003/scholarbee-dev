import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal = ({ open, onClose, videoUrl }: VideoModalProps) => {
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';

    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
      const questionPosition = videoId.indexOf('?');
      if (questionPosition !== -1) {
        videoId = videoId.substring(0, questionPosition);
      }
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden'
        },
        '& .MuiDialogContent-root': {
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
          overflow: 'hidden' // Hide scrollbar for all browsers
        }
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: 'relative',
          aspectRatio: '16/9',
          overflow: 'hidden'
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -40,
            top: -40,
            color: 'white',
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          {isYouTubeUrl(videoUrl) ? (
            <iframe
              title="YouTube video player"
              src={getYouTubeEmbedUrl(videoUrl)}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                backgroundColor: 'black',
                objectFit: 'contain'
              }}
            />
          ) : (
            <video
              title="Video player"
              width="100%"
              height="100%"
              controls
              autoPlay
              style={{
                backgroundColor: 'black',
                objectFit: 'contain'
              }}
            >
              <source src={videoUrl} />
              Your browser does not support the video tag.
            </video>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
