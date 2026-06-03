import { COLORS } from '@/constants/colors';

export const styles = {
  mainContainer: {
    p: 2,
    backgroundColor: 'white',
    borderRadius: 2
  },
  container: {
    mt: 2,
    p: 3,
    backgroundColor: COLORS.bgColor,
    borderRadius: 2,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    px: { xs: 2, sm: 1, md: 2 },
    mt: 2
  },

  summaryContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }
};
