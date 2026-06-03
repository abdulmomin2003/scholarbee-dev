import Image from 'next/image';
import quoteIcon from '@public/assets/svg/quote.svg';
import quoteWhiteIcon from '@public/assets/svg/quoteWhite.svg';
import polygonIcon from '@public/assets/svg/polygon.svg';

import { Box, Typography } from '@mui/material';

const ReviewCard = ({
  highlighted,
  review,
  reviewer
}: {
  highlighted?: boolean;
  reviewer: string;
  review: string;
}) => {
  return (
    <Box
      sx={{ ...styles.container, ...styles.columnJustify }}
      data-test-id="review-card"
    >
      <Box
        sx={{
          ...styles.card,
          backgroundColor: highlighted ? '#004ae0' : 'white'
        }}
        data-test-id="review-card-quote"
      >
        <Image
          src={highlighted ? quoteWhiteIcon : quoteIcon}
          alt="quoteIcon"
          width={25}
          height={20}
          data-test-id="quote-icon"
        />
        <Typography
          variant="body1"
          fontWeight="500"
          {...(highlighted && { color: 'white' })}
          sx={styles.quoteText}
          data-test-id="quote-text"
        >
          {review || ''}
        </Typography>
      </Box>
      {highlighted && (
        <Image
          src={polygonIcon}
          alt="polygonIcon"
          style={styles.polygonIcon}
          width={25}
          height={20}
          data-test-id="polygon-icon"
        />
      )}
      {/* <Image
        src="/assets/svg/avatar.svg"
        alt="avatarIcon"
        style={styles.avatar}
        width={48}
        height={48}
        data-test-id="avatar-icon"
      /> */}
      <Typography
        variant="h6"
        fontWeight="600"
        sx={styles.name}
        data-test-id="reviewer-name"
      >
        {reviewer || 'Anonymous'}
      </Typography>
    </Box>
  );
};

export default ReviewCard;

const styles = {
  container: {
    maxWidth: 400,
    margin: '0 auto'
  },
  columnJustify: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  card: {
    p: {
      xs: 5,
      md: 6
    },
    borderRadius: 2.5,
    textAlign: 'center'
  },
  highlightedText: {
    color: 'white'
  },
  quoteText: {
    mt: 2
  },
  polygonIcon: {
    marginTop: '-2px'
  },
  avatar: {
    marginTop: '12px'
  },
  name: {
    mt: 2
  }
};
