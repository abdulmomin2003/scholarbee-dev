'use client';
import React, { useState, useEffect, useRef, memo } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PartnerLogo } from './logoItem';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Design Constants
 */
const SLOT_COLORS = [
  'rgba(44, 57, 138, 0.9)', // Slot 1: Blue (Bahria)
  'rgba(174, 39, 36, 0.9)', // Slot 2: Red (TMUC)
  'rgba(17, 7, 92, 0.9)', // Slot 3: Deep Purple (UET)
  'rgba(3, 60, 104, 0.9)', // Slot 4: Foundation Blue
  'rgba(100, 41, 56, 0.9)', // Slot 5: Maroon (Ibadat)
  'rgba(0, 0, 0, 0.85)', // Slot 6: Bolton Dark
  'rgba(40, 54, 12, 0.9)', // Slot 7: Federal Urdu Green
  'rgba(0, 33, 71, 0.9)' // Slot 8: NASTP Navy
];

const GROUP_A = [0, 2, 5, 7]; // Staggered pattern
const GROUP_B = [1, 3, 4, 6];

/**
 * Variants for Premium Content Transition
 */
const contentVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] // Sharp but smooth ease-out
    }
  },
  exit: {
    opacity: 0,
    scale: 1.04,
    filter: 'blur(4px)',
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 1, 1]
    }
  }
};

/**
 * Utility: Sector Label Logic
 */
const getSector = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('government') || lower.includes('uet'))
    return 'Government University';
  if (
    lower.includes('technology') ||
    lower.includes('institute') ||
    lower.includes('foundation')
  )
    return 'Semi Government';
  if (
    lower.includes('bolton') ||
    lower.includes('millennium') ||
    lower.includes('tni')
  )
    return 'Transnational Institute (TNI)';
  return 'Private University';
};

/**
 * Optimized Card Component
 * Only rebuilds/re-renders if logo or color explicitly changes.
 */
const PartnerCard = memo(
  ({ logo, bgColor }: { logo: PartnerLogo; bgColor: string }) => {
    const sector = getSector(logo?.alt ?? '');

    const citySlug = logo?.citySlug ?? null;
    const uniPath = logo?.universitySlug ?? logo?.universityId;
    const clickUrl =
      !logo?.isStatic && citySlug && uniPath
        ? `/universities/${citySlug}/${uniPath}`
        : null;

    const cardContent = (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '312px',
          background: '#FFFFFF',
          overflow: 'hidden',
          boxSizing: 'border-box',
          cursor: clickUrl ? 'pointer' : 'default'
        }}
      >
        {/* Background Layer with Gradient & Image */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(0deg, ${bgColor}, ${bgColor}), url(/assets/png/cover1.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={logo?.universityId || logo?.alt}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}
          >
            {/* Sector Pill (Frame 1686554778) */}
            <Box
              sx={{
                position: 'absolute',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '6px 12px',
                width: 'max-content',
                maxWidth: '90%',
                minHeight: '32px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '70px',
                zIndex: 2,
                boxSizing: 'border-box',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  color: '#FFFFFF',
                  fontSize: { xs: '10px', sm: '12px' },
                  fontWeight: 400,
                  lineHeight: '16px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}
              >
                {sector}
              </Typography>
            </Box>

            {/* Logo Container (Frame 1686554780) */}
            <Box
              sx={{
                position: 'absolute',
                width: '96px',
                height: '96px',
                left: '50%',
                top: '156px', // Centering calculation: 312/2 = 156.
                transform: 'translate(-50%, -50%)',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
            >
              {logo?.url && (
                <Image
                  src={logo?.url}
                  alt={logo?.alt}
                  width={72}
                  height={72}
                  style={{
                    width: '72px',
                    height: '72px',
                    objectFit: 'contain'
                  }}
                />
              )}
            </Box>

            {/* Title (Bahria University) */}
            <Typography
              sx={{
                position: 'absolute',
                top: '220px',
                width: '100%',
                height: '30px',

                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: '18px',
                lineHeight: '30px',
                textAlign: 'center',
                color: '#FFFFFF',
                zIndex: 2,
                px: 2,
                boxSizing: 'border-box'
              }}
            >
              {logo?.alt}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>
    );

    return clickUrl ? (
      <Link
        href={clickUrl}
        prefetch={true}
        style={{
          textDecoration: 'none',
          display: 'block',
          height: '100%',
          width: '100%'
        }}
      >
        {cardContent}
      </Link>
    ) : (
      cardContent
    );
  }
);

PartnerCard.displayName = 'PartnerCard';

/**
 * Main Grid Component
 */
const PartnerUniversitiesGrid: React.FC<{ partnerLogos: PartnerLogo[] }> = ({
  partnerLogos
}) => {
  const [activeIndices, setActiveIndices] = useState<number[]>(() =>
    Array.from({ length: Math.min(8, partnerLogos.length) }, (_, i) => i)
  );

  const phaseRef = useRef(0);
  const logosRef = useRef(partnerLogos);

  // Keep ref sync with prop updates
  useEffect(() => {
    logosRef.current = partnerLogos;
  }, [partnerLogos]);

  // Replacement Engine
  useEffect(() => {
    if (logosRef.current.length <= 8) return;

    const interval = setInterval(() => {
      const groupToUpdate = phaseRef.current === 0 ? GROUP_A : GROUP_B;
      phaseRef.current = (phaseRef.current + 1) % 2;

      setActiveIndices((current) => {
        const next = [...current];
        const gridSet = new Set(current);

        // Find indices in pool (not on screen)
        const pool = logosRef.current
          .map((_, i) => i)
          .filter((idx) => !gridSet.has(idx))
          .sort(() => Math.random() - 0.5);

        if (pool.length === 0) return current;

        // Shuffle group slots to distribute updates if pool < 4
        const targetSlots = [...groupToUpdate].sort(() => Math.random() - 0.5);

        targetSlots.forEach((slotIdx, i) => {
          if (pool[i] !== undefined) {
            next[slotIdx] = pool[i];
          }
        });

        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ width: '100%', mt: { xs: 0, md: 0 } }}>
      <Grid container spacing={0}>
        {activeIndices.map((logoIdx, slotIdx) => (
          <Grid
            key={slotIdx}
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ height: '312px' }}
          >
            <PartnerCard
              logo={partnerLogos[logoIdx]}
              bgColor={SLOT_COLORS[slotIdx]}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PartnerUniversitiesGrid;
