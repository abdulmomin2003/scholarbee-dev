import { useRef, useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCarousel = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sliderRef = useRef<any>(null);

  const handleNext = useCallback(() => {
    sliderRef.current?.slickNext();
  }, []);

  const handlePrev = useCallback(() => {
    sliderRef.current?.slickPrev();
  }, []);

  return {
    sliderRef,
    handleNext,
    handlePrev
  };
};
