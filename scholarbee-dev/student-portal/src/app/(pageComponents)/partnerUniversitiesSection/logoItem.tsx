'use client';
import React, { useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

// Placeholder image for universities without logos
const PLACEHOLDER_LOGO = '/assets/svg/partners/partner.svg';

// Types
export interface PartnerLogo {
  url: string;
  alt: string;
  isStatic: boolean;
  universityId: string | null;
  universitySlug?: string | null;
  campusId: string | null;
  citySlug?: string | null;
}

// Same URL pattern as footer partner links: /universities/[citySlug]/[uniSlug]
const getUniversityUrl = (logo: PartnerLogo): string | null => {
  if (logo.isStatic) return null;
  const citySlug = logo.citySlug ?? null;
  const uniPath = logo.universitySlug ?? logo.universityId;
  if (!citySlug || !uniPath) return null;
  return `/universities/${citySlug}/${uniPath}`;
};

interface LogoItemProps {
  logo: PartnerLogo;
  styles: any;
}

const LogoItem: React.FC<LogoItemProps> = ({ logo, styles }) => {
  const universityUrl = useMemo(() => getUniversityUrl(logo), [logo]);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!logo.isStatic) {
        const target = e.target as HTMLImageElement;
        if (target.src !== PLACEHOLDER_LOGO) {
          target.src = PLACEHOLDER_LOGO;
        }
      }
    },
    [logo.isStatic]
  );

  const logoContent = (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
      }}
    >
      <Image
        src={logo?.url}
        alt={logo?.alt}
        width={180}
        height={120}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          objectPosition: 'center'
        }}
        onError={handleImageError}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        ...styles.logoItem,
        ...(universityUrl && {
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        })
      }}
    >
      {universityUrl ? (
        <Link
          href={universityUrl}
          style={{ textDecoration: 'none', display: 'block' }}
        >
          {logoContent}
        </Link>
      ) : (
        logoContent
      )}
    </Box>
  );
};

export default LogoItem;
