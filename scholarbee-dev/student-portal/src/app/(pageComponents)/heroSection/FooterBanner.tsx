'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface FooterBannerProps {
  styles: any;
}

const FooterBanner: React.FC<FooterBannerProps> = ({ styles }) => {
  // Footer items configuration - repeated for seamless scroll
  const footerItems = [
    { type: 'star' },
    { type: 'circle' },
    { type: 'star' },
    { type: 'circle' },
    { type: 'star' },
    { type: 'circle' },
    { type: 'star' },
    { type: 'circle' },
    { type: 'star' },
    { type: 'circle' },
    { type: 'star' },
    { type: 'circle' },
    { type: 'star' },
    { type: 'circle' },
    { type: 'star' },
    { type: 'circle' }
  ];

  return (
    <Box sx={styles.footerBanner}>
      <Box
        component={motion.div}
        sx={styles.footerContent}
        animate={{
          x: ['0%', '-50%']
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {/* First set of items */}
        {footerItems.map((item, index) => (
          <Box key={`first-${index}`} sx={styles.footerItem}>
            {item.type === 'star' ? (
              <Box sx={styles.footerStar} />
            ) : (
              <Box sx={styles.footerCircle} />
            )}
            <Typography variant="body2" fontWeight={500} sx={styles.footerText}>
              ScholarBee
            </Typography>
          </Box>
        ))}
        {/* Duplicate set for seamless scroll */}
        {footerItems.map((item, index) => (
          <Box key={`second-${index}`} sx={styles.footerItem}>
            {item.type === 'star' ? (
              <Box sx={styles.footerStar} />
            ) : (
              <Box sx={styles.footerCircle} />
            )}
            <Typography variant="body2" fontWeight={500} sx={styles.footerText}>
              ScholarBee
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FooterBanner;
