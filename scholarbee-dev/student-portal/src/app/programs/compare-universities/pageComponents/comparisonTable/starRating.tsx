import { Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface StarRatingProps {
  rating: number; // e.g., 4.5
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingBottom: '16px',
        gap: '5.65px',
        width: '100%',
        height: 16
      }}
    >
      {/* Full Stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <Box
          key={`full-${index}`}
          sx={{
            position: 'relative',
            width: '16.94px',
            height: '16px',
            flexShrink: 0
          }}
        >
          <StarIcon
            sx={{
              width: '16.94px',
              height: '16px',
              color: '#FFCB45',
              filter: 'drop-shadow(0 0 1px #DFB300)',
              fontSize: '16.94px'
            }}
          />
        </Box>
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <Box
          sx={{
            position: 'relative',
            width: '16.94px',
            height: '16px',
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '50%',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <StarIcon
              sx={{
                width: '16.94px',
                height: '16px',
                color: '#FFCB45',
                filter: 'drop-shadow(0 0 1px #DFB300)',
                fontSize: '16.94px',
                position: 'absolute',
                left: 0
              }}
            />
          </Box>
          <StarBorderIcon
            sx={{
              width: '16.94px',
              height: '16px',
              color: '#F2F2F2',
              fontSize: '16.94px',
              position: 'absolute',
              left: 0,
              top: 0
            }}
          />
        </Box>
      )}

      {/* Empty Stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <StarBorderIcon
          key={`empty-${index}`}
          sx={{
            width: '16.94px',
            height: '16px',
            color: '#F2F2F2',
            fontSize: '16.94px',
            flexShrink: 0
          }}
        />
      ))}
    </Box>
  );
};

export default StarRating;
