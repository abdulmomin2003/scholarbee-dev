'use client';
import WithPaper from '@/components/atoms/withPaper';
import { Box, Typography, ImageList, ImageListItem } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

const CampusPictures = () => {
  const [showGallery, setShowGallery] = useState(false);

  // Convert itemData to react-image-gallery format
  const galleryImages = itemData.map((item, index) => ({
    original: '/assets/png/campus-image3.png',
    thumbnail: '/assets/png/campus-image3.png',
    description: `Campus Image ${index + 1}`
  }));

  const handleImageClick = () => {
    setShowGallery(true);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  return (
    <WithPaper title="Campus Pictures">
      <ImageList
        sx={{ width: '100%', overflow: 'hidden' }}
        variant="quilted"
        cols={5}
        gap={20}
        rowHeight={200}
      >
        {itemData.slice(0, 8).map((item, index) => (
          <ImageListItem
            key={item.img}
            cols={item.cols}
            rows={item.rows}
            onClick={handleImageClick}
            sx={{ cursor: 'pointer' }}
          >
            <Image
              src="/assets/png/campus-image3.png"
              alt={`Campus ${index + 1}`}
              style={{
                borderRadius: '8px',
                width: '100%',
                height: '100%'
              }}
              height={178}
              width={204}
            />
            {index === 7 && (
              <Box sx={styles.overlay}>
                <Typography sx={styles.overlayText}>+2 More</Typography>
              </Box>
            )}
          </ImageListItem>
        ))}
      </ImageList>

      {/* Image Gallery Modal */}
      {showGallery && (
        <Box sx={styles.galleryModal} onClick={handleCloseGallery}>
          <Box
            sx={styles.galleryContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <ImageGallery
              items={galleryImages}
              showThumbnails={true}
              showFullscreenButton={true}
              showPlayButton={false}
              showNav={true}
              showBullets={false}
              autoPlay={false}
              slideInterval={3000}
              renderCustomControls={() => (
                <Box sx={styles.closeButton}>
                  <Typography
                    onClick={handleCloseGallery}
                    sx={{
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      padding: '10px'
                    }}
                  >
                    ×
                  </Typography>
                </Box>
              )}
            />
          </Box>
        </Box>
      )}
    </WithPaper>
  );
};

export default CampusPictures;

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
    rows: 2,
    cols: 3
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
    cols: 2,
    rows: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 2,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    cols: 1,
    row: 1
  }
];

const styles = {
  imageBox: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    height: '100%',
    width: '100%',
    cursor: 'pointer'
  },
  overlayText: {
    variant: 'h6',
    color: 'white',
    fontWeight: 600
  },
  galleryModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  galleryContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    '& .image-gallery': {
      height: '100vh',
      backgroundColor: 'white'
    },
    '& .image-gallery-content': {
      backgroundColor: 'white'
    },
    '& .image-gallery-slide': {
      backgroundColor: 'white'
    },
    '& .image-gallery-image': {
      backgroundColor: 'white',
      maxHeight: '80vh'
    },
    '& .image-gallery-thumbnails': {
      backgroundColor: 'white',
      borderTop: '1px solid #e0e0e0'
    },
    '& .image-gallery-thumbnail': {
      border: '2px solid transparent',
      '&.active': {
        border: '2px solid #1976d2'
      }
    }
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.7)'
    }
  }
};
