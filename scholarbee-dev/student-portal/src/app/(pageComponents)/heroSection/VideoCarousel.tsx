'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { VIDEO_DATA } from '@/constants';

interface VideoCarouselProps {
  styles: any;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ styles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLIFrameElement | null>(null);

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';

    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
      const questionPosition = videoId.indexOf('?');
      if (questionPosition !== -1) {
        videoId = videoId.substring(0, questionPosition);
      }
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
  };

  // Stop interval
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start interval
  const startInterval = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % VIDEO_DATA.length);
    }, 8000);
  }, [stopInterval]);

  // Initialize interval
  useEffect(() => {
    if (!isVideoPlaying && !isFocused) {
      startInterval();
    } else {
      stopInterval();
    }

    return () => {
      stopInterval();
    };
  }, [isVideoPlaying, isFocused, startInterval, stopInterval]);

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    stopInterval();
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    if (!isVideoPlaying) {
      startInterval();
    }
  };

  // Handle video click
  const handleVideoClick = () => {
    setIsVideoPlaying(true);
    stopInterval();
  };

  // Handle video end (using YouTube API)
  useEffect(() => {
    if (isVideoPlaying && videoRef.current) {
      const handleMessage = (event: MessageEvent) => {
        if (
          event.data === 'ended' ||
          (event.data &&
            event.data.event === 'onStateChange' &&
            event.data.info === 0)
        ) {
          setIsVideoPlaying(false);
          if (!isFocused) {
            startInterval();
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [isVideoPlaying, isFocused, startInterval]);

  const currentVideo = VIDEO_DATA[currentIndex];

  return (
    <Box sx={styles.videoContainer}>
      <AnimatePresence mode="wait">
        <Box
          component={motion.div}
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -20 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
          }}
          sx={styles.videoFrame}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleVideoClick}
          tabIndex={0}
        >
          {isVideoPlaying ? (
            <Box
              component="iframe"
              ref={videoRef}
              src={getYouTubeEmbedUrl(currentVideo.videoUrl)}
              sx={styles.videoIframe}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              <Image
                src={currentVideo.imageUrl}
                alt={currentVideo.title}
                fill
                style={{
                  objectFit: 'contain',
                  borderRadius: '16px'
                }}
                priority
                sizes="(max-width: 768px) 100vw, 678px"
              />
              {/* Play Button Overlay */}
              <Box sx={styles.playButton}>
                <Box sx={styles.playButtonCircle}>
                  <Box sx={styles.playButtonTriangle} />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </AnimatePresence>
    </Box>
  );
};

export default VideoCarousel;
