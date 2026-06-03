export const styles = {
  mainContainer: {},
  leftGrid: {
    background: 'linear-gradient(174deg, #4A9DE0 2.64%, #0B3B95 92.87%)',
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightGrid: {
    display: 'flex',
    flexDirection: 'column'
  },
  rightBox: {
    display: 'flex',
    flex: 1,
    width: '100%',
    justifyContent: 'center'
  },
  innerBox: {
    width: '100%',
    maxWidth: '570px',
    paddingX: '20px',
    my: 5,
    display: 'flex', // Add this
    flexDirection: 'column', // Add this
    alignItems: 'center' // Add this
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(11, 60, 149, 0.10)',
    fontWeight: 'bold',
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px'
  },
  mainText: {
    mb: 4,
    fontSize: '18px',
    mt: 2
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column', // Ensure fields stack vertically
    gap: 2,
    mb: 3,
    paddingBottom: '20px',
    width: '100%'
  },
  inputProps: {
    sx: {
      borderRadius: '8px',
      paddingRight: '0px'
    }
  },
  subscribeButton: {
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '8px',
    mt: 2
  },
  captionText: {
    fontSize: '12px',
    mb: 2
  },
  textField: {
    mb: 1 // Space between fields
  }
};
