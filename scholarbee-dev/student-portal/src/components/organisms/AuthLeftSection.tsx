'use client';
import { Box, Typography, Link } from '@mui/material';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoWhite from '@public/assets/svg/logo-white.svg';
import { COLORS } from '@/constants/colors';

interface AuthLeftSectionProps {
  animatedWords?: string[];
  staticText?: string;
}

const AuthLeftSection: React.FC<AuthLeftSectionProps> = ({
  animatedWords = ['Admissions', 'Scholarships', 'Your Next Move'],
  staticText = 'One Platform for'
}) => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [animatedWords.length]);

  return (
    <Box sx={styles.leftGrid}>
      <Box sx={styles.leftCard}>
        <Box sx={styles.leftContent}>
          {/* Logo */}
          <Box sx={styles.logoBox}>
            <Image
              src={logoWhite}
              alt="ScholarBee Logo"
              width={180}
              height={44}
            />
          </Box>

          {/* Animated Text */}
          <Box sx={styles.animatedTextBox}>
            <Typography sx={styles.onePlatformText}>{staticText}</Typography>
            <AnimatePresence mode="wait">
              <motion.div
                key={animatedWords[wordIndex]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <Typography sx={styles.animatedText}>
                  {animatedWords[wordIndex]}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* Footer Links */}
          <Box sx={styles.leftFooter}>
            <Link href="/terms-and-conditions" sx={styles.footerLink}>
              Terms and Conditions
            </Link>
            <Box sx={styles.footerDot} />
            <Link href="/privacy-policy" sx={styles.footerLink}>
              Privacy Policy
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLeftSection;

const flexCenter = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const absoluteFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

const styles = {
  leftGrid: {
    width: { xs: '100%', md: '50%' },
    height: { xs: 'auto', md: '100vh' },
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    alignItems: 'center',
    p: { xs: 0, md: 2 },
    overflow: 'hidden'
  },

  leftCard: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundImage: 'url("/assets/png/bgAuth.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: { xs: 0, md: '24px' },
    overflow: 'hidden',
    p: { xs: 3, sm: 4, md: 2 },
    ...flexCenter,
    justifyContent: 'space-between',
    '&::before': {
      content: '""',
      ...absoluteFill,
      background:
        'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.045) 100%)',
      zIndex: 1
    }
  },

  leftContent: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    height: '100%',
    p: 0,
    ...flexCenter,
    justifyContent: 'space-between'
  },

  logoBox: {
    mt: { xs: 1, md: 2 },
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },

  animatedTextBox: {
    ...flexCenter,
    justifyContent: 'center',
    flexGrow: 1,
    gap: { xs: 0.5, md: 1 },
    textAlign: 'center',
    width: '100%',
    minHeight: { xs: '100px', md: '150px' }
  },

  onePlatformText: {
    fontWeight: 400,
    fontSize: { xs: '24px', sm: '32px', md: '40px' },
    lineHeight: { xs: '32px', sm: '40px', md: '48px' },
    color: COLORS.white,
    letterSpacing: '-0.01em'
  },

  animatedText: {
    fontWeight: 600,
    fontSize: { xs: '32px', sm: '44px', md: '56px' },
    lineHeight: { xs: '40px', sm: '52px', md: '68px' },
    color: COLORS.white
  },

  leftFooter: {
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },

  footerLink: {
    color: COLORS.white,
    fontSize: { xs: '12px', md: '14px' },
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' }
  },

  footerDot: {
    width: { xs: '4px', md: '6px' },
    height: { xs: '4px', md: '6px' },
    bgcolor: COLORS.white,
    borderRadius: '50%'
  }
};
