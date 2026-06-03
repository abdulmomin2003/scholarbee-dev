'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const EXPLORE_OPTIONS = [
  { text: 'Explore Programs', link: '/programs' },
  { text: 'Explore Scholarships', link: '/search-scholarship' },
  { text: 'Explore Universities', link: '/universities' }
];

interface ExploreButtonProps {
  isLoggedIn: boolean;
  styles: any;
}

const ExploreButton: React.FC<ExploreButtonProps> = ({
  isLoggedIn,
  styles
}) => {
  const [exploreIndex, setExploreIndex] = useState(0);

  // Auto-switch explore text every 5 seconds
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      setExploreIndex((prevIndex) => (prevIndex + 1) % EXPLORE_OPTIONS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  if (isLoggedIn) {
    return (
      <Link
        href={EXPLORE_OPTIONS[exploreIndex].link}
        style={{
          textDecoration: 'none',
          width: '100%'
        }}
        aria-label={EXPLORE_OPTIONS[exploreIndex].text}
        title={EXPLORE_OPTIONS[exploreIndex].text}
      >
        <Button sx={styles.loginButton}>
          <Box
            sx={{
              position: 'relative',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '200px'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={exploreIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.4,
                  ease: 'easeInOut'
                }}
                style={{
                  position: 'absolute',
                  width: '100%'
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={500}
                  sx={styles.loginButtonText}
                >
                  {EXPLORE_OPTIONS[exploreIndex].text}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Button>
      </Link>
    );
  }

  return (
    <Link
      href="/sign-up"
      style={{ textDecoration: 'none', width: '100%' }}
      aria-label="Go to sign up"
      title="Sign Up"
    >
      <Button sx={styles.loginButton}>
        <Typography variant="h6" fontWeight={500} sx={styles.loginButtonText}>
          Sign Up
        </Typography>
      </Button>
    </Link>
  );
};

export default ExploreButton;
