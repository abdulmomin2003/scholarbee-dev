import { Grid, Box, Typography } from '@mui/material';
import Image from 'next/image';
import { styles } from '../../styles';
import { UniversityData } from '../../types';
import { isDomainAllowed } from '@/utils/helperFunctions';
import { COLORS } from '@/constants/colors';

interface ComparisonTableHeaderProps {
  data: UniversityData[];
  threeColumns?: boolean;
}

const ComparisonTableHeader: React.FC<ComparisonTableHeaderProps> = ({
  data,
  threeColumns
}) => {
  return (
    <Grid spacing={2} container>
      <Grid
        size={{ xs: 12, md: threeColumns ? 3 : 4 }}
        sx={{
          backgroundColor: 'white',
          // borderRight: `1px solid ${COLORS.borderColor}`,
          borderBottom: `1px solid ${COLORS.borderColor}`,
          // borderRadius: 3,
          zIndex: 10
        }}
      >
        <Box sx={styles.titleBox}>
          <Typography variant="h6" fontWeight={500}>
            University/College/Institute
          </Typography>
        </Box>
      </Grid>
      <Grid
        sx={{ borderTopLeftRadius: '24px' }}
        size={{ xs: 12, md: threeColumns ? 9 : 8 }}
      >
        <Grid
          container
          sx={{ borderTopLeftRadius: '24px' }}
          mt={-2}
          pt={2}
          bgcolor="white"
        >
          {data?.map((item, index) => (
            <Grid
              size={{ xs: 12, md: threeColumns ? 4 : 6 }}
              sx={{
                pb: 2,
                borderBottom: `1px solid ${COLORS.borderColor}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              key={item._id || index}
            >
              <Box sx={styles.headerBox}>
                <Image
                  src={
                    item.campusLogo && isDomainAllowed(item.campusLogo)
                      ? item.campusLogo
                      : '/assets/png/university_placeholder.png'
                  }
                  alt={`${item.universityName} Logo`}
                  width={104}
                  height={100}
                  style={{
                    objectFit: 'contain'
                  }}
                />
                <Typography variant="h6" sx={styles.universityName}>
                  {item.universityName}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ComparisonTableHeader;
