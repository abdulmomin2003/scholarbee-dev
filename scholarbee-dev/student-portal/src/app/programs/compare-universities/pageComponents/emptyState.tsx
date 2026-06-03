import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <Box sx={styles.emptyState}>
      <Typography variant="h6" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyState;

const styles = {
  emptyState: {
    bgcolor: 'background.paper',
    p: 4,
    borderRadius: 1,
    textAlign: 'center'
  }
};
