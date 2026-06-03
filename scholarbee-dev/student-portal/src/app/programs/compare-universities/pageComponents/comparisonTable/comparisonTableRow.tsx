import { Grid, Box, Typography } from '@mui/material';
import { ComparisonCriteria, UniversityData } from '../../types';
import { COLORS } from '@/constants/colors';

interface ComparisonTableRowProps {
  criteria: ComparisonCriteria;
  data: UniversityData[];
  isAlternate: boolean;
  threeColumns?: boolean;
}

const ComparisonTableRow: React.FC<ComparisonTableRowProps> = ({
  criteria,
  data,
  isAlternate,
  threeColumns
}) => {
  const getValue = (item: UniversityData) => {
    const value = item[criteria.key];
    if (criteria.formatValue) {
      const formattedValue = criteria.formatValue(value);
      return {
        value: formattedValue,
        isUpdateSoon: formattedValue === 'Will Update Soon'
      };
    }
    return {
      value: value?.toString() || '-',
      isUpdateSoon: false
    };
  };

  return (
    <Grid spacing={2} container>
      <Grid
        size={{ xs: 12, md: threeColumns ? 3 : 4 }}
        sx={{
          backgroundColor: 'white'
          // borderRight: `1px solid ${COLORS.borderColor}`
        }}
      >
        <Box sx={styles.valueBox}>
          <Typography variant="body1" fontWeight={600}>
            {criteria.label}
          </Typography>
        </Box>
      </Grid>
      <Grid
        size={{ xs: 12, md: threeColumns ? 9 : 8 }}
        sx={{ borderRadius: 1 }}
      >
        <Grid
          sx={{
            height: '100%',
            bgcolor: isAlternate ? COLORS.tableRowBackgroundColor : 'white'
            // borderBottom: `1px solid ${COLORS.borderColor}`
          }}
          container
        >
          {data?.map((item, index) => {
            const { value, isUpdateSoon } = getValue(item);
            return (
              <Grid
                size={{ xs: 12, md: threeColumns ? 4 : 6 }}
                key={`${item._id}-${index}`}
              >
                <Box sx={styles.valueBox}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: isUpdateSoon ? COLORS.primary : 'inherit'
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ComparisonTableRow;

const styles = {
  valueBox: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    // bordertop: '1px solid #000',
    // borderRadius: 1,
    textAlign: 'center'
  }
};
