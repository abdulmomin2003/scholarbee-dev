'use client';
import React from 'react';
import { useFavoriteProgram } from '@/hooks/useFavoriteProgram';
import ProgramFavoriteButton from '../(pageComponents)/programCard/programFavoriteButton';

export default function FavoriteButtonClient({
  programId,
  isFavorite
}: {
  programId: string;
  isFavorite?: boolean;
}) {
  const {
    handleAddFavoriteProgram,
    isAddingFavoriteProgram,
    isRemovingFavoriteProgram,
    handleRemoveFavoriteProgram
  } = useFavoriteProgram();

  return (
    <ProgramFavoriteButton
      programId={programId}
      isFavorite={isFavorite}
      addProgramToFavorite={handleAddFavoriteProgram}
      removeProgramFromFavorite={handleRemoveFavoriteProgram}
      isAddingToFavorite={isAddingFavoriteProgram}
      isRemovingFromFavorite={isRemovingFavoriteProgram}
      isProcessingOrRemoving={
        isAddingFavoriteProgram || isRemovingFavoriteProgram
      }
    />
  );
}
