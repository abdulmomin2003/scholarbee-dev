import { COLORS } from '@/constants/colors';

export const styles = {
  applicationGrid: {
    borderRadius: '12px',
    border: `1px solid ${COLORS.applicationItemBorder}`,
    p: 2,
    minWidth: 0,
    width: '100%',
    overflow: 'hidden'
  },
  section: {
    mb: 3,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: 4
  },
  savedSection: {
    backgroundColor: COLORS.white,
    borderRadius: 4,
    p: 2
  },
  savedProgram: {
    borderRadius: '12px',
    border: `1px solid ${COLORS.applicationItemBorder}`,
    p: 2
  },
  statText: { fontSize: { xs: 12, sm: 14 } },
  savedProgramPaper: {
    position: 'relative',
    height: 200,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 20px 0px rgba(0, 0, 0, 0.08)',
    borderRadius: 3
  },
  heartBox: {
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 1.5,
    height: '36px',
    width: '36px',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: '#FF00001A',
    position: 'absolute',
    top: 10,
    right: 10
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    mt: 1
  },
  divider: {
    margin: { xs: 0.5, lg: 1 },
    display: {
      xs: 'none',
      md: 'block'
    }
  },
  conversationStack: {
    maxHeight: '540px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555'
    }
  }
};
