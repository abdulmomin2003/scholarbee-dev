'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMediaQuery, useTheme } from '@mui/material';
import logo from '@public/assets/svg/logo.svg';

export default function NavLogo() {
  const theme = useTheme();
  const isXsOrSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Link
      href="/"
      style={{ textDecoration: 'none', cursor: 'pointer' }}
      passHref
      aria-label="ScholarBee home"
      title="Go to home"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={logo}
          height={isXsOrSm ? 28 : 36}
          width={isXsOrSm ? 130 : 167}
          alt="logo"
          priority
        />
      </motion.div>
    </Link>
  );
}
