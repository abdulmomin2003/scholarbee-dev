import LinearProgress from '@mui/material/LinearProgress';
import { Box } from '@mui/material';
import { COLORS } from '@/constants/colors';

export default function CustomizedProgressBars({ value }: { value: number }) {
  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: '5px',
        overflow: 'hidden',
        mb: 2
      }}
    >
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: '10px',
          backgroundColor: COLORS.bgColor,
          '& .MuiLinearProgress-bar': {
            backgroundColor: 'primary.main'
          }
        }}
      />
    </Box>
  );
}
