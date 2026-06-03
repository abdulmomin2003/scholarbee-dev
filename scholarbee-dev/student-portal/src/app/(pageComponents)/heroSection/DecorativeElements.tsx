'use client';
import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface DecorativeElementsProps {
  styles: any;
}

const DecorativeElements: React.FC<DecorativeElementsProps> = ({ styles }) => {
  return (
    <>
      <Box
        component={motion.div}
        sx={styles.decorativePurpleDot}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          y: [0, -20, -10, -20, 0],
          x: [0, 15, -10, 15, 0],
          scale: [1, 1.15, 1.05, 1.15, 1],
          opacity: [0.8, 1, 0.9, 1, 0.8],
          rotate: [0, 5, -5, 5, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0
        }}
      />
      <Box
        component={motion.div}
        sx={styles.decorativeYellowStar}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          y: [0, -25, -15, -25, 0],
          x: [0, -20, 15, -20, 0],
          rotate: [0, 15, -15, 20, -20, 0],
          scale: [1, 1.2, 1.1, 1.2, 1],
          opacity: [0.9, 1, 0.95, 1, 0.9]
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5
        }}
      />
      <Box
        component={motion.div}
        sx={styles.decorativeRedDot}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          y: [0, -18, -8, -28, 0],
          x: [0, -15, 12, -15, 0],
          scale: [1, 1.5, 1.1, 1.35, 1],
          opacity: [0.85, 1, 0.9, 1, 0.85],
          rotate: [0, -10, 10, -10, 0]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0
        }}
      />
    </>
  );
};

export default DecorativeElements;
