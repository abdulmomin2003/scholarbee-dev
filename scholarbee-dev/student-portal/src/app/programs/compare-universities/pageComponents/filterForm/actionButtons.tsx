import { Box, Button } from '@mui/material';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import { COLORS } from '@/constants/colors';

interface ActionButtonsProps {
  getTagsCount: () => number;
  handleReset: () => void;
  handleCompare: () => Promise<void>;
  isComparing: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  getTagsCount,
  handleReset,
  handleCompare,
  isComparing
}) => {
  const tagsCount = getTagsCount();
  const isCompareDisabled = isComparing || tagsCount < 2;

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column-reverse', sm: 'row' }}
      alignItems="center"
      gap={{ xs: '12px', sm: '24px' }}
      width="100%"
      sx={{ mt: 2 }}
    >
      <Button
        sx={{
          height: '56px',
          width: { xs: '100%', sm: '150px' },
          border: '1px solid #004AE0',
          borderRadius: '8px',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          color: '#004AE0',
          fontWeight: 400,
          fontSize: '16px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            border: '1px solid #004AE0',
            bgcolor: 'rgba(0, 74, 224, 0.05)'
          },
          '&.Mui-disabled': {
            border: '1px solid #ccc',
            color: '#ccc'
          }
        }}
        onClick={handleReset}
        startIcon={<RestartAltOutlinedIcon />}
        variant="outlined"
        disabled={getTagsCount() === 0 || isComparing}
      >
        Reset
      </Button>
      <Button
        disabled={isCompareDisabled}
        onClick={handleCompare}
        variant="contained"
        sx={{
          height: '56px',
          width: { xs: '100%', sm: '256px' },
          bgcolor: COLORS.primary,
          color: 'white',
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '16px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: COLORS.primaryDark,
            boxShadow: 'none'
          },
          '&.Mui-disabled': {
            bgcolor: '#F2F2F3',
            color: '#B0B3B7'
          }
        }}
      >
        {isComparing ? 'Comparing...' : 'Compare'}
      </Button>
    </Box>
  );
};

export default ActionButtons;
