import {
  useAddFavoriteProgramMutation,
  useRemoveFavoriteProgramMutation,
  useTrackRecommendationEventMutation
} from '@/redux/api/programApi';
import { useCallback } from 'react';

export const useFavoriteProgram = () => {
  const [addFavoriteProgram, { isLoading: isAddingFavoriteProgram }] =
    useAddFavoriteProgramMutation();

  const [removeFavoriteProgram, { isLoading: isRemovingFavoriteProgram }] =
    useRemoveFavoriteProgramMutation();

  const [trackEvent] = useTrackRecommendationEventMutation();

  const handleAddFavoriteProgram = useCallback(
    async (admissionProgramId: string) => {
      if (!admissionProgramId) return;
      try {
        await addFavoriteProgram({ admissionProgramId }).unwrap();
        trackEvent({
          event_type: 'favorite',
          resource_type: 'admission_program',
          resource_id: admissionProgramId,
          metadata: { favorited_at: new Date().toISOString() }
        }).catch((err: any) => console.error('Failed to track favorite event:', err));
      } catch (error) {
        console.error('Failed to add program to favorites:', error);
      }
    },
    [addFavoriteProgram, trackEvent]
  );

  const handleRemoveFavoriteProgram = useCallback(
    async (admissionProgramId: string) => {
      if (!admissionProgramId) return;
      try {
        await removeFavoriteProgram({ admissionProgramId }).unwrap();
      } catch (error) {
        console.error('Failed to remove program from favorites:', error);
      }
    },
    [removeFavoriteProgram]
  );

  return {
    handleAddFavoriteProgram,
    isAddingFavoriteProgram,
    handleRemoveFavoriteProgram,
    isRemovingFavoriteProgram
  };
};
