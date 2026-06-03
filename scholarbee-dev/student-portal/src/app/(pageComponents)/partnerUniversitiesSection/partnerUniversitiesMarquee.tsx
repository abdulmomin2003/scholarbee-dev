'use client';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import LogoItem, { PartnerLogo } from './logoItem';

const marquee = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

interface PartnerUniversitiesMarqueeProps {
  partnerLogos: PartnerLogo[];
  styles: any;
}

const PartnerUniversitiesMarquee: React.FC<PartnerUniversitiesMarqueeProps> = ({
  partnerLogos,
  styles
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      sx={styles.marqueeContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        sx={{
          ...styles.marqueeTrack,
          animation: `${marquee} 30s linear infinite`,
          animationPlayState: isHovered ? 'paused' : 'running'
        }}
      >
        {/* First set of logos */}
        {partnerLogos.map((logo, index) => (
          <LogoItem key={`first-${index}`} logo={logo} styles={styles} />
        ))}
        {/* Duplicate set for seamless loop */}
        {partnerLogos.map((logo, index) => (
          <LogoItem key={`second-${index}`} logo={logo} styles={styles} />
        ))}
      </Box>
    </Box>
  );
};

export default PartnerUniversitiesMarquee;
