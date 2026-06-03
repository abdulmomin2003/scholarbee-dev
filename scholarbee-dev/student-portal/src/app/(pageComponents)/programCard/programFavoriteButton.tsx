import { Box } from '@mui/material';
import Image from 'next/image';
import React, { useCallback, useState, useEffect } from 'react';
import { styles } from './styles';

const ProgramFavoriteButton = ({
  programId,
  isFavorite,
  addProgramToFavorite,
  removeProgramFromFavorite,
  isAddingToFavorite,
  isRemovingFromFavorite,
  isProcessingOrRemoving
}: {
  programId: string;
  isFavorite?: boolean;
  addProgramToFavorite: (programId: string) => void;
  removeProgramFromFavorite: (programId: string) => void;
  isAddingToFavorite?: boolean;
  isRemovingFromFavorite?: boolean;
  isProcessingOrRemoving?: boolean;
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

      if (!programId || isProcessing) {
        return;
      }

      setIsProcessing(true);
      setOptimisticFavorite(!displayedFavorite);

      try {
        if (displayedFavorite) {
          await removeProgramFromFavorite(programId);
        } else {
          await addProgramToFavorite(programId);
        }
      } catch (error) {
        console.error('Error toggling program favorite:', error);
        // Do not revert here — parent already handles it
      } finally {
        setIsProcessing(false);
      }
    },
    [
      programId,
      displayedFavorite,
      addProgramToFavorite,
      removeProgramFromFavorite,
      isProcessing
    ]
  );

  const isBackendProcessing =
    isAddingToFavorite || isRemovingFromFavorite || isProcessingOrRemoving;
  const isDisabled = isProcessing || isBackendProcessing;

  return (
    <Box
      onClick={handleFavorite}
      sx={styles.favoriteButton({
        isDisabled: isDisabled ?? false,
        isFavorite: Boolean(displayedFavorite)
      })}
    >
      <Box sx={styles.favoriteIconWrapper}>
        <Image
          src={`/assets/svg/${displayedFavorite ? 'heart-red' : 'heart-outlined'}.svg`}
          alt="favorite"
          fill
          style={{
            ...styles.favoriteIcon(isDisabled ?? false),
            objectFit: 'contain'
          }}
        />
      </Box>
    </Box>
  );
};

export default ProgramFavoriteButton;
