import { Box, Link, Stack, Typography } from '@mui/material';
import Image from 'next/image';

const normalizeWebsiteUrl = (rawValue: string): string | null => {
  const trimmedValue = rawValue?.trim();

  if (!trimmedValue || trimmedValue === '_') {
    return null;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};

const CampusInfoItem = ({
  label,
  value,
  logo,
  type
}: {
  label: string;
  value: string;
  logo: string;
  type?: string;
}) => {
  const websiteHref = type === 'link' ? normalizeWebsiteUrl(value) : null;

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Image src={logo} alt={label} width={32} height={32} />
      <Box>
        <Typography variant="body1">{label}</Typography>

        {type === 'link' && websiteHref ? (
          <Link
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}
          >
            {value}
          </Link>
        ) : (
          <Typography variant="h6" fontWeight={500}>
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};
export default CampusInfoItem;
