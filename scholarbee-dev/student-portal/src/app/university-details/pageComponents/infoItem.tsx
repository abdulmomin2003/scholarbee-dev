import { Box, Stack, Typography, Tooltip } from '@mui/material';
import Image from 'next/image';

const InfoItem = ({
  label,
  value,
  logo,
  isLongText
}: {
  label: string;
  value: string;
  logo: string;
  isLongText?: boolean;
}) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Image src={logo} alt={label} width={32} height={32} />
      <Box>
        <Typography
          variant="body1"
          fontSize={18}
          fontWeight={500}
          color="white"
        >
          {label}
        </Typography>

        {isLongText ? (
          <Tooltip title={value} arrow>
            <Typography
              variant="body1"
              fontSize={18}
              fontWeight={500}
              color="white"
              sx={{
                cursor: 'help',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '200px'
              }}
            >
              {value}
            </Typography>
          </Tooltip>
        ) : (
          <Typography
            variant="body1"
            fontSize={18}
            fontWeight={500}
            color="white"
          >
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};
export default InfoItem;
