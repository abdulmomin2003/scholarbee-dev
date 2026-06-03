import { Box, Divider, Typography } from '@mui/material';
import Link from 'next/link';
import type { AboutUniItem } from './buildAdmissionProgramViewModel';
import { styles } from './[id]/styles';

export default function ProgramDetailsAboutSection({
  items
}: {
  items: AboutUniItem[];
}) {
  return (
    <Box sx={styles.container}>
      {items.map((item, index) => (
        <Box key={`${item.subtitle}-${index}`} sx={{ display: 'contents' }}>
          <Box sx={styles.infoBox}>
            {item.link ? (
              <Link
                href={item.link}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {item.title}
                </Typography>
              </Link>
            ) : (
              <Typography variant="h6" fontWeight="bold">
                {item.title}
              </Typography>
            )}
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
  );
}
