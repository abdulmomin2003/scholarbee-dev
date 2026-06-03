import { Box, Divider, Typography } from '@mui/material';
import DetailsAccordion from './pageComponents/detailsAccordion';
import type { ProgramOverviewItem } from './buildAdmissionProgramViewModel';
import { styles } from './[id]/styles';

export default function ProgramDetailsOverviewSection({
  title,
  items
}: {
  title: string;
  items: ProgramOverviewItem[];
}) {
  return (
    <Box>
      <Typography component="h2" mt={2} mb={1} variant="h5" fontWeight="600">
        Program Overview
      </Typography>
      <DetailsAccordion
        summary={
          <Typography variant="body1" component="h3" fontSize={18}>
            {title}
          </Typography>
        }
        details={
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-evenly'
            }}
          >
            {items.map((item, index) => (
              <Box
                key={`${item.subtitle}-${index}`}
                sx={{ display: 'contents' }}
              >
                <Box sx={styles.infoBox}>
                  <Typography variant="h6" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography variant="body2">{item.subtitle}</Typography>
                </Box>
                {index < items.length - 1 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      margin: { xs: 0.5, lg: 1 },
                      display: { xs: 'none', md: 'block' }
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        }
      />
    </Box>
  );
}
