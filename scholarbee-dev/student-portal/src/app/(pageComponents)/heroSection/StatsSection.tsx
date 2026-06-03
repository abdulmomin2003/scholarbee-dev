'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';

// Custom hook for animated counter
const useAnimatedCounter = (
  targetValue: number | string,
  duration: number = 2000
): number | string => {
  const [count, setCount] = React.useState<number | string>(0);
  const startTimeRef = React.useRef<number | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (targetValue === '0' || typeof targetValue === 'string') {
      setCount(targetValue);
      return;
    }

    const startValue = 0;
    const endValue = targetValue;
    const startTime = performance.now();

    startTimeRef.current = startTime;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentCount = Math.floor(
        startValue + (endValue - startValue) * easeOut
      );
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      startTimeRef.current = null;
    };
  }, [targetValue, duration]);

  return count;
};

interface StatsSectionProps {
  campuses: number | string;
  programs: number | string;
  scholarships: number | string;
  styles: any;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  campuses,
  programs,
  scholarships,
  styles
}) => {
  const animatedCampuses = useAnimatedCounter(campuses);
  const animatedPrograms = useAnimatedCounter(programs);
  const animatedScholarships = useAnimatedCounter(scholarships);

  return (
    <Box sx={styles.statsContainer}>
      <Box sx={styles.statsContent}>
        {/* Institutes */}
        <Box sx={styles.statGroup}>
          <Typography sx={styles.statNumber}>
            {typeof animatedCampuses === 'number'
              ? animatedCampuses.toLocaleString()
              : animatedCampuses}
            +
          </Typography>
          <Typography sx={styles.statLabel}>Institutes</Typography>
        </Box>

        {/* Programs */}
        <Box sx={styles.statGroup}>
          <Typography sx={styles.statNumber}>
            {typeof animatedPrograms === 'number'
              ? animatedPrograms.toLocaleString()
              : animatedPrograms}
            +
          </Typography>
          <Typography sx={styles.statLabel}>Programs</Typography>
        </Box>

        {/* Scholarships */}
        <Box sx={styles.statGroup}>
          <Typography sx={styles.statNumber}>
            {typeof animatedScholarships === 'number'
              ? animatedScholarships.toLocaleString()
              : animatedScholarships}
            +
          </Typography>
          <Typography sx={styles.statLabel}>Scholarships</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StatsSection;
