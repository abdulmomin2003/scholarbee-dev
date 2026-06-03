import { Box } from '@mui/material';
import Image from 'next/image';
import React, { useCallback, useState, useEffect } from 'react';

const FavoriteButton = ({
  scholarshipId,
  isFavorite,
  addScholarshipToFavorite,
  removeScholarshipFromFavorite,
  isAddingToFavorite,
  isRemovingFromFavorite
}: {
  scholarshipId: string;
  isFavorite?: boolean;
  addScholarshipToFavorite: (scholarshipId: string) => void;
  removeScholarshipFromFavorite: (scholarshipId: string) => void;
  isAddingToFavorite?: boolean;
  isRemovingFromFavorite?: boolean;
}) => {
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync optimistic state if parent prop changes
  useEffect(() => {
    setOptimisticFavorite(isFavorite);
  }, [isFavorite]);

  const displayedFavorite = optimisticFavorite ?? isFavorite;

  const handleFavorite = useCallback(
    async (e: { preventDefault: () => void; stopPropagation: () => void }) => {
      e.preventDefault();
      e.stopPropagation();

      if (!scholarshipId || isProcessing) {
        return;
      }

      setIsProcessing(true);
      setOptimisticFavorite(!displayedFavorite);

      try {
        if (displayedFavorite) {
          await removeScholarshipFromFavorite(scholarshipId);
        } else {
          await addScholarshipToFavorite(scholarshipId);
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        // Do not revert here — parent already handles it
      } finally {
        setIsProcessing(false);
      }
    },
    [
      scholarshipId,
      displayedFavorite,
      addScholarshipToFavorite,
      removeScholarshipFromFavorite,
      isProcessing
    ]
  );

  const isBackendProcessing = isAddingToFavorite || isRemovingFromFavorite;
  const isDisabled = isProcessing || isBackendProcessing;

  return (
    <Box
      onClick={handleFavorite}
      sx={{
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        backgroundColor: 'rgba(11, 60, 149, 0.10)',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        transition: 'all 0.3s ease-in-out',
        transform: 'scale(1)',
        '&:hover': {
          opacity: isDisabled ? 0.5 : 1,
          backgroundColor: isDisabled
            ? 'rgba(11, 60, 149, 0.10)'
            : 'rgba(11, 60, 149, 0.20)',
          transform: isDisabled ? 'scale(1)' : 'scale(1.05)',
          boxShadow: isDisabled
            ? 'none'
            : '0px 4px 12px rgba(11, 60, 149, 0.25)'
        },
        '&:active': {
          transform: isDisabled ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.1s ease-in-out'
        }
      }}
    >
      <Image
        src={
          displayedFavorite
            ? '/assets/svg/heart-red.svg'
            : '/assets/svg/heart-outlined.svg'
        }
        alt="heart_icon"
        width={28}
        height={28}
      />
    </Box>
  );
};

export default FavoriteButton;
