import { Box } from '@mui/material';
import Image from 'next/image';
import React, { useCallback, useState, useEffect } from 'react';

const CampusFavoriteButton = ({
  campusId,
  isFavorite,
  addCampusToFavorite,
  removeCampusFromFavorite,
  isAddingToFavorite,
  isRemovingFromFavorite,
  isProcessingOrRemoving
}: {
  campusId: string;
  isFavorite?: boolean;
  addCampusToFavorite: (campusId: string) => void;
  removeCampusFromFavorite: (campusId: string) => void;
  isAddingToFavorite?: boolean;
  isRemovingFromFavorite?: boolean;
  isProcessingOrRemoving?: boolean;
}) => {
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setOptimisticFavorite(isFavorite);
  }, [isFavorite]);

  const displayedFavorite = optimisticFavorite ?? isFavorite;

  const handleFavorite = useCallback(
    async (e: { preventDefault: () => void; stopPropagation: () => void }) => {
      e.preventDefault();
      e.stopPropagation();

      if (!campusId || isProcessing) {
        return;
      }

      setIsProcessing(true);
      setOptimisticFavorite(!displayedFavorite);

      try {
        if (displayedFavorite) {
          await removeCampusFromFavorite(campusId);
        } else {
          await addCampusToFavorite(campusId);
        }
      } catch (error) {
        console.error('Error toggling campus favorite:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      campusId,
      displayedFavorite,
      addCampusToFavorite,
      removeCampusFromFavorite,
      isProcessing
    ]
  );

  const isBackendProcessing =
    isAddingToFavorite || isRemovingFromFavorite || isProcessingOrRemoving;
  const isDisabled = isProcessing || isBackendProcessing;

  return (
    <Box
      onClick={handleFavorite}
      sx={styles.favoriteButton(isDisabled ?? false)}
    >
      <Image
        src={`/assets/svg/${displayedFavorite ? 'heart' : 'heart-outlined'}.svg`}
        alt="favorite"
        width={24}
        height={24}
        style={styles.favoriteIcon(isDisabled ?? false)}
      />
    </Box>
  );
};

export default CampusFavoriteButton;

const styles = {
  favoriteButton: (isProcessing: boolean) => ({
    backgroundColor: 'rgba(11, 60, 149, 0.10)',
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 1.5,
    height: '48px',
    width: '48px',
    cursor: isProcessing ? 'not-allowed' : 'pointer',
    opacity: isProcessing ? 0.5 : 1,
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    pointerEvents: isProcessing ? 'none' : 'auto',
    transform: 'scale(1)',
    '&:hover': {
      opacity: isProcessing ? 0.5 : 1,
      backgroundColor: isProcessing
        ? 'rgba(11, 60, 149, 0.10)'
        : 'rgba(11, 60, 149, 0.20)',
      transform: isProcessing ? 'scale(1)' : 'scale(1.05)',
      boxShadow: isProcessing ? 'none' : '0px 4px 12px rgba(11, 60, 149, 0.25)'
    },
    '&:active': {
      transform: isProcessing ? 'scale(1)' : 'scale(0.95)',
      transition: 'transform 0.1s ease-in-out'
    }
  }),
  favoriteIcon: (isProcessing: boolean) =>
    ({
      opacity: isProcessing ? 0.7 : 1,
      transition: 'opacity 0.2s ease-in-out'
    }) as React.CSSProperties
};
