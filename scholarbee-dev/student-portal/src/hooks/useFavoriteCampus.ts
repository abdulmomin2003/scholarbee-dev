import {
  useAddCampusToFavoritesMutation,
  useRemoveCampusFromFavoritesMutation
} from '@/redux/api/campusesApi';
import { useCallback } from 'react';

export const useFavoriteCampus = () => {
  const [addFavoriteCampus, { isLoading: isAddingFavoriteCampus }] =
    useAddCampusToFavoritesMutation();

  const [removeFavoriteCampus, { isLoading: isRemovingFavoriteCampus }] =
    useRemoveCampusFromFavoritesMutation();

  const handleAddFavoriteCampus = useCallback(
    async (campusId: string) => {
      if (!campusId) return;
      try {
        await addFavoriteCampus({ campusId }).unwrap();
      } catch (error) {
        console.error('Failed to add campus to favorites:', error);
      }
    },
    [addFavoriteCampus]
  );

  const handleRemoveFavoriteCampus = useCallback(
    async (campusId: string) => {
      if (!campusId) return;
      try {
        await removeFavoriteCampus({ campusId }).unwrap();
      } catch (error) {
        console.error('Failed to remove campus from favorites:', error);
      }
    },
    [removeFavoriteCampus]
  );

  return {
    handleAddFavoriteCampus,
    isAddingFavoriteCampus,
    handleRemoveFavoriteCampus,
    isRemovingFavoriteCampus
  };
};
