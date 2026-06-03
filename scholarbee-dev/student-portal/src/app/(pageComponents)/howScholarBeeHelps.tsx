'use client';
import Tag from '@/components/atoms/tag';
import { Box, Container, Typography } from '@mui/material';
import userIcon from '@public/assets/svg/user.svg';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const styles = {
  root: {
    background: '#FFFFFF',
    py: {
      xs: 3,
      md: 4,
      lg: 5
    }
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '813px',
    margin: '0 auto',
    mb: { xs: 2, md: 3 }
  },
  tag: {
    backgroundColor: '#F4F7FF',
    borderRadius: '50px',
    boxShadow: '0px 1px 15px rgba(0, 0, 0, 0.05)'
  },
  title: {
    fontWeight: 600,
    textAlign: 'center',
    color: '#252525',
    mt: 1
  },
  featureCard: {
    borderRadius: { xs: '8px', md: '8px 8px 20px 20px' },
    overflow: 'hidden',
    mb: { xs: 2, md: 3 },
    margin: '0 auto',
    height: { xs: 'auto', md: '320px' },
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  },
  cardContent: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    px: { xs: 2, md: 4 },
    py: { xs: 3, md: 0 },
    gap: { xs: 2, md: 3 }
  },
  textContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: { xs: '100%', md: '500px' },
    zIndex: 1
  },
  subtitleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  subtitle: {
    fontWeight: 500,
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center'
  },
  featureTitle: {
    fontWeight: 500
  },
  description: {
    fontWeight: 400
  },
  imageContainer: {
    position: { xs: 'relative', md: 'absolute' },
    bottom: 0,
    width: { xs: '200px', md: '260px' },
    height: { xs: 'auto', md: 'auto' },
    flexShrink: 0
  }
};

const FEATURES = [
  {
    title: 'Find Your Best-Fit Program',
    subtitle: 'ADMISSIONS SUPPORT',
    subtitleColor: '#35AAFD',
    titleColor: '#001F33',
    descriptionColor: '#011E32',
    content:
      'ScholarBee helps you compare universities and programs based on your marks, interests, budget, and goals, so you can choose the option that best fits you.',
    image: '/assets/svg/unlock.svg',
    imageAlt: 'Admissions support graphic',
    backgroundColor: '#EBF6FF',
    imagePosition: { xs: 'center', md: 'right' }
  },
  {
    title: 'Apply Smartly & Save Time',
    subtitle: 'SCHOLARSHIP SUPPORT',
    subtitleColor: '#802BFF',
    titleColor: '#140033',
    descriptionColor: '#140033',
    content:
      'ScholarBee helps you find relevant scholarships based on your marks, background, and financial needs, all on one platform, saving you time.',
    image: '/assets/svg/apply.svg',
    imageAlt: 'Scholarship support graphic',
    backgroundColor: '#F3EBFF',
    imagePosition: { xs: 'center', md: 'right' }
  },
  {
    title: 'Discover More Opportunities',
    subtitle: 'ACCESS TO MULTIPLE UNIVERSITIES',
    subtitleColor: '#06EF1D',
    titleColor: '#013206',
    descriptionColor: '#013206',
    content:
      'ScholarBee connects you to every HEC-recognized university across Pakistan so you can compare programs, explore new options, and choose what matches your plans.',
    image: '/assets/svg/partner.svg',
    imageAlt: 'Access to multiple universities graphic',
    backgroundColor: '#F0FFF2',
    imagePosition: { xs: 'center', md: 'right' }
  }
];

const FeatureBlock = ({
  feature,
  isActive
}: {
  feature: {
    title: string;
    subtitle: string;
    subtitleColor: string;
    titleColor: string;
    descriptionColor: string;
    content: string;
    image: string;
    imageAlt: string;
    backgroundColor: string;
    imagePosition: { xs: string; md: string };
  };
  isActive: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{
      opacity: isActive ? 1 : 0,
      y: isActive ? 0 : 50,
      scale: isActive ? 1 : 0.95
    }}
    transition={{
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }}
    style={{
      position: isActive ? 'relative' : 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      pointerEvents: isActive ? 'auto' : 'none'
    }}
  >
    <Box
      sx={{
        ...styles.featureCard,
        backgroundColor: feature.backgroundColor
      }}
    >
      <Box sx={styles.cardContent}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{
            opacity: isActive ? 1 : 0,
            x: isActive ? 0 : -30
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{ width: '100%' }}
        >
          <Box sx={styles.textContent}>
            <Box sx={styles.subtitleSection}>
              <Typography
                variant="subtitle2"
                sx={{
                  ...styles.subtitle,
                  color: feature.subtitleColor
                }}
              >
                {feature.subtitle}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  ...styles.featureTitle,
                  color: feature.titleColor
                }}
              >
                {feature.title}
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                ...styles.description,
                color: feature.descriptionColor
              }}
            >
              {feature.content}
            </Typography>
          </Box>
        </motion.div>
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: 30 }}
          animate={{
            opacity: isActive ? 1 : 0,
            x: isActive ? 0 : 30
          }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          sx={{
            ...styles.imageContainer,
            right: { md: '72px' },
            bottom: { md: '0' }
          }}
        >
          <Image
            src={feature.image}
            alt={feature.imageAlt}
            width={320}
            height={320}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain'
            }}
            priority
          />
        </Box>
      </Box>
    </Box>
  </motion.div>
);

const HowScholarBeeHelps = ({ ...props }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play carousel - change feature every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % FEATURES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <Box
      {...props}
      sx={{
        ...styles.root,
        position: 'relative'
      }}
    >
      <Container sx={{ width: '100%', py: { xs: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={styles.headerContainer}>
            <Tag icon={userIcon} title="How Do We Do?" sx={styles.tag} />
            <Typography component="h2" variant="h4" sx={styles.title}>
              How ScholarBee Helps You Succeed
            </Typography>
          </Box>
        </motion.div>

        {/* Single animated container that transitions between features */}
        <Box
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          sx={{
            position: 'relative',
            minHeight: { xs: 'auto', md: '320px' },
            mt: { xs: 2, md: 3 },
            overflow: 'hidden'
          }}
        >
          {FEATURES.map((feature, index) => (
            <FeatureBlock
              key={index}
              feature={feature}
              isActive={activeIndex === index}
            />
          ))}
        </Box>

        {/* Scroll indicator dots */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            mt: 3
          }}
        >
          {FEATURES.map((_, index) => (
            <motion.div
              key={index}
              onClick={() => setActiveIndex(index)}
              style={{
                width: activeIndex === index ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor:
                  activeIndex === index
                    ? FEATURES[activeIndex].subtitleColor
                    : '#D1D5DB',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowScholarBeeHelps;
