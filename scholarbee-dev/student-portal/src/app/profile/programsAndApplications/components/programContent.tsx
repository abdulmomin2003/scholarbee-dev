import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { getPaymentScheduleLabel } from '@/utils/helperFunctions';
import { styles } from '../styles';
import Image from 'next/image';

const ProgramCardContent = ({
  hasPassed = true,
  programHref = '/programs'
}: {
  hasPassed?: boolean;
  programHref?: string;
}) => {
  return (
    <>
      <Box sx={styles.savedProgramPaper}>
        <Box sx={styles.heartBox}>
          <Image
            src={'/assets/svg/heart.svg'}
            alt="heart"
            width={24}
            height={24}
          />
        </Box>
        <Image
          src={'/assets/svg/bahria.svg'}
          alt="program"
          width={124}
          height={124}
        />
      </Box>

      <Typography mt={2} fontSize={18} fontWeight="600">
        Sindh Endowment Fund Scholarship-SEF
      </Typography>

      {/* </Stack> */}
      <Box
        gap={1}
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={styles.detailRow}>
          <Image
            src={`/assets/svg/${hasPassed ? 'calendar' : 'calendar-primary'}.svg`}
            alt="calendar"
            width={24}
            height={24}
            priority
          />
          <Box>
            <Typography
              variant="body2"
              sx={styles.statText}
              color={hasPassed ? 'error' : 'primary.main'}
            >
              Deadline
            </Typography>
            <Typography
              sx={styles.statText}
              variant="body1"
              fontWeight="600"
              color={hasPassed ? 'error' : 'primary.main'}
            >
              24 Nov 2024
            </Typography>
          </Box>
        </Box>
        <Box sx={styles.detailRow}>
          <Image
            src="/assets/svg/fee-icon.svg"
            alt="fee icon"
            width={24}
            height={24}
            priority
          />
          <Box>
            <Typography sx={styles.statText} variant="body2">
              {`Fee (${getPaymentScheduleLabel(undefined)})`}
            </Typography>
            <Typography sx={styles.statText} variant="body1" fontWeight="600">
              PKR 20,000
            </Typography>
          </Box>
        </Box>

        <Box sx={styles.detailRow}>
          <Image
            src="/assets/svg/teacher.svg"
            alt="teacher"
            width={24}
            height={24}
            priority
          />
          <Box>
            <Typography sx={styles.statText} variant="body2">
              {'Study Mode'}
            </Typography>
            <Typography sx={styles.statText} variant="body1" fontWeight="600">
              Online
            </Typography>
          </Box>
        </Box>
      </Box>

      <Link
        href={programHref}
        style={{ textDecoration: 'none', width: '100%' }}
      >
        <Button
          sx={{ mt: 2, width: '100%' }}
          variant="contained"
          fullWidth
          component="span"
        >
          View Program
        </Button>
      </Link>
    </>
  );
};

export default ProgramCardContent;
