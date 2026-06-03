'use client';
import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import Link from 'next/link';
import { COLORS } from '@/constants/colors';

const styles = {
  section: {
    backgroundColor: COLORS.institutesSectionBg,
    py: { xs: 8, md: 10 },
    position: 'relative',
    overflow: 'hidden'
  },
  headerBox: {
    textAlign: 'center',
    mb: 6,
    maxWidth: '880px',
    mx: 'auto'
  },
  title: {
    fontWeight: 600,
    fontSize: { xs: '32px', md: '40px' },
    lineHeight: 1.4,
    color: COLORS.textPrimary,
    mb: 1
  },
  subtitle: {
    fontWeight: 400,
    fontSize: { xs: '18px', md: '22px' },
    lineHeight: 1.45,
    color: COLORS.textSecondary
  },
  card: {
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
    }
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '40px',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  tagDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  },
  cardTitle: {
    fontWeight: 600,
    color: COLORS.textPrimary
  },
  cardDescription: {
    color: 'rgba(33, 37, 41, 0.8)'
  }
};

const SECTOR_CARDS = [
  {
    id: 'partner',
    href: '/universities?partner_university=true',
    gridColumn: { md: 'span 8' },
    gridRow: { md: 'span 2' },
    bgImage: '/assets/png/institutes/partner.png',
    minHeight: '544px',
    padding: 4,
    tagLabel: 'TRUSTED PARTNER',
    dotColor: COLORS.trustedPartnerTagDot,
    tagGradient:
      'linear-gradient(135deg, rgba(81, 162, 255, 0.1) 0%, rgba(43, 127, 255, 0.1) 50%, rgba(79, 57, 246, 0.1) 100%)',
    arrowColors: ['#51A2FF', '#2B7FFF', '#4F39F6'],
    iconSize: 108,
    iconGradient:
      'linear-gradient(135deg, #51A2FF 0%, #2B7FFF 50%, #4F39F6 100%)',
    glowColor: COLORS.trustedPartnerGlow,
    iconSrc: '/assets/svg/institutes/partner.svg',
    iconImgSize: 54,
    title: 'Partner Universities',
    titleVariant: 'h4' as const,
    titleMb: 1,
    descVariant: 'body1' as const,
    descFontSize: '18px',
    description:
      'Explore and apply directly to our network of top rated partner institutions.',
    contentMt: 'auto'
  },
  {
    id: 'gov',
    href: '/campuses?university_type=government',
    gridColumn: { md: 'span 4' },
    gridRow: undefined,
    bgImage: '/assets/png/institutes/government.png',
    minHeight: '260px',
    padding: 3,
    tagLabel: 'HIGH MERIT',
    dotColor: COLORS.highMeritTagDot,
    tagGradient:
      'linear-gradient(270deg, rgba(0, 224, 97, 0.1) 0%, rgba(0, 192, 19, 0.1) 100%)',
    arrowColors: ['#00E061', '#00C013'],
    iconSize: undefined,
    iconGradient: 'linear-gradient(135deg, #00E061 0%, #00C013 100%)',
    glowColor: COLORS.highMeritGlow,
    iconSrc: '/assets/svg/institutes/government.svg',
    iconImgSize: 32,
    title: 'Government Universities',
    titleVariant: 'h6' as const,
    titleMb: 0,
    descVariant: 'body2' as const,
    descFontSize: undefined,
    description:
      'Join  respected public institutions known for academic standards and merit-based entry.',
    contentMt: 0
  },
  {
    id: 'private',
    href: '/campuses?university_type=private',
    gridColumn: { md: 'span 4' },
    gridRow: undefined,
    bgImage: '/assets/png/institutes/private.png',
    minHeight: '260px',
    padding: 3,
    tagLabel: 'INNOVATION HUB',
    dotColor: COLORS.innovationHubTagDot,
    tagGradient:
      'linear-gradient(90deg, rgba(238, 53, 53, 0.1) -6.3%, rgba(252, 131, 2, 0.1) 114.29%)',
    arrowColors: ['#EE3535', '#FC8302'],
    iconSize: undefined,
    iconGradient: 'linear-gradient(135deg, #EE3535 0%, #FC8302 114.29%)',
    glowColor: COLORS.white,
    iconSrc: '/assets/svg/institutes/private.svg',
    iconImgSize: 32,
    title: 'Private Universities',
    titleVariant: 'h6' as const,
    titleMb: 0,
    descVariant: 'body2' as const,
    descFontSize: undefined,
    description:
      "Study within dynamic campuses built to help you succeed in today's world.",
    contentMt: 0
  },
  {
    id: 'semi',
    href: '/campuses?university_type=semi-government',
    gridColumn: { md: 'span 4' },
    gridRow: undefined,
    bgImage: '/assets/png/institutes/semi.png',
    minHeight: '260px',
    padding: 3,
    tagLabel: 'HYBRID MODEL',
    dotColor: COLORS.hybridModelTagDot,
    tagGradient:
      'linear-gradient(270deg, rgba(187, 0, 224, 0.1) 0%, rgba(105, 2, 178, 0.1) 100%)',
    arrowColors: ['#BB00E0', '#6902B2'],
    iconSize: undefined,
    iconGradient: 'linear-gradient(135deg, #BB00E0 0%, #6902B2 100%)',
    glowColor: COLORS.hybridModelGlow,
    iconSrc: '/assets/svg/institutes/semi.svg',
    iconImgSize: 32,
    title: 'Semi-Government Universities',
    titleVariant: 'h6' as const,
    titleMb: 0,
    descVariant: 'body2' as const,
    descFontSize: undefined,
    description:
      'Benefit from institutions that offer the best of both public and private education.',
    contentMt: 0
  },
  {
    id: 'trans',
    href: '/campuses?university_type=tni',
    gridColumn: { md: 'span 8' },
    gridRow: undefined,
    bgImage: '/assets/png/institutes/tni.png',
    minHeight: '260px',
    padding: 4,
    tagLabel: 'GLOBAL REACH',
    dotColor: COLORS.globalReachTagDot,
    tagGradient:
      'linear-gradient(270deg, rgba(233, 9, 144, 0.1) 0%, rgba(192, 7, 100, 0.1) 100%)',
    arrowColors: ['#E90990', '#C00764'],
    iconSize: undefined,
    iconGradient: 'linear-gradient(135deg, #E90990 0%, #C00764 100%)',
    glowColor: COLORS.globalReachGlow,
    iconSrc: '/assets/svg/institutes/tni.svg',
    iconImgSize: 32,
    title: 'Transnational Institutes (TNI)',
    titleVariant: 'h6' as const,
    titleMb: 0,
    descVariant: 'body2' as const,
    descFontSize: undefined,
    description:
      'Secure a world-class degree from a foreign university without leaving home.',
    contentMt: 0
  }
];

const SectorArrow = ({ id, colors }: { id: string; colors: string[] }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id={`mask-${id}`} fill="white">
      <path d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z" />
    </mask>
    <path
      d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z"
      fill="white"
      fillOpacity="0.05"
    />
    <path
      d="M0 16M32 16M32 16M0 16M16 0M32 16M16 32M0 16M16 32V31.2C7.60527 31.2 0.8 24.3947 0.8 16H0H-0.8C-0.8 25.2784 6.72162 32.8 16 32.8V32ZM32 16H31.2C31.2 24.3947 24.3947 31.2 16 31.2V32V32.8C25.2784 32.8 32.8 25.2784 32.8 16H32ZM16 0V0.8C24.3947 0.8 31.2 7.60527 31.2 16H32H32.8C32.8 6.72162 25.2784 -0.8 16 -0.8V0ZM16 0V-0.8C6.72162 -0.8 -0.8 6.72162 -0.8 16H0H0.8C0.8 7.60527 7.60527 0.8 16 0.8V0Z"
      fill={`url(#paint0-${id})`}
      fillOpacity="0.5"
      mask={`url(#mask-${id})`}
    />
    <path
      d="M9 16L23 16"
      stroke={`url(#paint1-${id})`}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 11L23 16L18 21"
      stroke={`url(#paint2-${id})`}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id={`paint0-${id}`}
        x1="0"
        y1="0"
        x2="32"
        y2="32"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={colors[0]} />
        {colors.length > 1 && (
          <stop offset="1" stopColor={colors[colors.length - 1]} />
        )}
      </linearGradient>
      <linearGradient
        id={`paint1-${id}`}
        x1="9"
        y1="16"
        x2="9.14213"
        y2="17.9898"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={colors[0]} />
        {colors.length > 1 && (
          <stop offset="1" stopColor={colors[colors.length - 1]} />
        )}
      </linearGradient>
      <linearGradient
        id={`paint2-${id}`}
        x1="18"
        y1="11"
        x2="26"
        y2="15"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={colors[0]} />
        {colors.length > 1 && (
          <stop offset="1" stopColor={colors[colors.length - 1]} />
        )}
      </linearGradient>
    </defs>
  </svg>
);

const CardHeader = ({
  label,
  dotColor,
  bgGradient,
  id,
  arrowColors
}: {
  label: string;
  dotColor: string;
  bgGradient: string;
  id: string;
  arrowColors: string[];
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ mb: 2, width: '100%' }}
  >
    <Box sx={{ ...styles.tag, background: bgGradient }}>
      <Box sx={{ ...styles.tagDot, backgroundColor: dotColor }} />
      <Typography variant="caption" sx={{ color: dotColor, fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
    <Box>
      <SectorArrow id={id} colors={arrowColors} />
    </Box>
  </Stack>
);

const ClayIconContainer = ({
  size = 64,
  gradient,
  glowColor,
  children
}: {
  size?: number;
  gradient: string;
  glowColor: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: size > 80 ? '27px' : '16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: gradient,
      boxShadow:
        size > 80
          ? '0px 2.25px 4.5px rgba(0, 0, 0, 0.1), 0px 9px 27px rgba(0, 0, 0, 0.15), inset 0px 2.25px 9px rgba(255, 255, 255, 0.4), inset 0px -2.25px 9px rgba(0, 0, 0, 0.15)'
          : '0px 1.33px 2.66px rgba(0, 0, 0, 0.1), 0px 5.33px 16px rgba(0, 0, 0, 0.15), inset 0px 1.33px 5.33px rgba(255, 255, 255, 0.4), inset 0px -1.33px 5.33px rgba(0, 0, 0, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: '-15%',
        left: '-15%',
        width: '60%',
        height: '60%',
        background: glowColor,
        filter: 'blur(12px)',
        opacity: 0.4,
        borderRadius: '50%'
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '50%',
        height: '40%',
        background: 'white',
        filter: 'blur(10px)',
        opacity: 0.25,
        borderRadius: '50%'
      }}
    />
    {children}
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '25%',
        background: 'black',
        opacity: 0.1
      }}
    />
  </Box>
);

const InstitutionalSectorSection = () => {
  return (
    <Box component="section" sx={styles.section}>
      <Container maxWidth="lg">
        <Box sx={styles.headerBox}>
          <Typography variant="h2" sx={styles.title}>
            Explore by{' '}
            <span style={{ color: COLORS.primary }}>Institutional Sector</span>
          </Typography>
          <Typography sx={styles.subtitle}>
            Find the right institute to study from our hand-picked list of
            government, private, and international universities.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
            gap: 4
          }}
        >
          {SECTOR_CARDS.map((card) => (
            <Box
              key={card.id}
              component={Link}
              href={card.href}
              sx={{
                ...styles.card,
                gridColumn: card.gridColumn,
                ...(card.gridRow && { gridRow: card.gridRow }),
                background: `url("${card.bgImage}") center / cover no-repeat`,
                p: card.padding,
                minHeight: card.minHeight
              }}
            >
              <CardHeader
                id={card.id}
                label={card.tagLabel}
                dotColor={card.dotColor}
                bgGradient={card.tagGradient}
                arrowColors={card.arrowColors}
              />

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <ClayIconContainer
                  size={card.iconSize}
                  gradient={card.iconGradient}
                  glowColor={card.glowColor}
                >
                  <img
                    src={card.iconSrc}
                    alt={card.title}
                    style={{
                      width: `${card.iconImgSize}px`,
                      height: `${card.iconImgSize}px`,
                      position: 'relative',
                      zIndex: 1
                    }}
                  />
                </ClayIconContainer>
              </Box>

              <Box sx={{ mt: card.contentMt }}>
                <Typography
                  variant={card.titleVariant}
                  sx={{ ...styles.cardTitle, mb: card.titleMb }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant={card.descVariant}
                  sx={{
                    ...styles.cardDescription,
                    ...(card.descFontSize && { fontSize: card.descFontSize })
                  }}
                >
                  {card.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default InstitutionalSectorSection;
