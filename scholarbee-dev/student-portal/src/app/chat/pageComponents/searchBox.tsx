import { COLORS } from '@/constants/colors';
import { Box, Container, InputBase, Stack } from '@mui/material';
import Image from 'next/image';

const SearchBox = ({
  chatSearch,
  handleSearch
}: {
  chatSearch: string;
  handleSearch: (value: string) => void;
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('search');
    }
  };

  return (
    <Box sx={styles.wrapper}>
      <Container disableGutters>
        <Stack direction={'row'} sx={styles.searchContainer}>
          <Box sx={styles.inputWrapper}>
            <Image
              height={24}
              width={24}
              alt="search icon"
              src="/assets/svg/search-icon.svg"
            />
            <InputBase
              sx={styles.input}
              placeholder={'Search Universities, Campus etc.'}
              inputProps={{
                'aria-label': 'search scholarships and universities'
              }}
              value={chatSearch}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

const styles = {
  wrapper: {
    my: 1
  },
  searchContainer: {
    py: 2,
    px: 2,
    borderRadius: 2,
    bgcolor: COLORS.bgColor
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    mr: 2
  },
  input: {
    ml: 2,
    flex: 1,
    fontWeight: 500
    // fontSize: '26px',
    // '& ::placeholder': {
    //   color: COLORS.inputPlaceholderColor,
    //   opacity: 0.7
    // }
  },
  searchButton: {
    px: 7,
    py: 2
  }
};

export default SearchBox;
