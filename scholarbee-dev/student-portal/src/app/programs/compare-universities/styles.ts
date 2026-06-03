import { COLORS } from '@/constants/colors';

export const styles = {
  section: {
    py: 4
  },
  contentBox: {
    // bgcolor: 'background.paper',
    backgroundColor: COLORS.bgColor,
    overflow: 'auto',
    // p: 3
    borderRadius: 1
  },
  headerBox: {
    borderTopLeftRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    px: 1,
    // borderRadius: 1,
    backgroundColor: 'white'
  },
  universityName: {
    fontWeight: 500,
    fontSize: 20,
    textAlign: 'center'
  },
  titleBox: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // p: 2,
    borderRadius: 1,
    textAlign: 'center'
  },
  valueBox: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    borderRadius: 1,
    textAlign: 'center'
  },
  emptyState: {
    bgcolor: 'background.paper',
    p: 4,
    borderRadius: 1,
    textAlign: 'center'
  }
};

export const selectStyles = {
  container: {
    maxWidth: '350px',
    width: '100%',
    margin: 'auto'
  },
  label: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    mb: 1
  },
  autocomplete: {
    borderRadius: '12px'
  },
  noBorder: {
    '& .MuiFilledInput-root': {
      backgroundColor: '#F7F8F9',
      borderRadius: '8px',
      '&:before': {
        borderBottom: 'none'
      },
      '&:hover:before': {
        borderBottom: 'none !important'
      },
      '&:after': {
        borderBottom: 'none'
      }
    }
  }
};
