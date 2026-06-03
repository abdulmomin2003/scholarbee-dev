'use client';
import WithPaper from '@/components/atoms/withPaper';
import {
  Box,
  Button,
  Stack,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import { DISTANCE_OPTIONS, RATING_OPTIONS } from '../constants';
import SimpleSelect from '@/components/atoms/simpleSelect';
import NearByPlaceCard from './nearbyPlaceCard';
import GoogleMap from './googleMap';

interface Location {
  latitude: number;
  longitude: number;
}

interface GooglePlace {
  name: string;
  rating?: number;
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
  types: string[];
  photos?: Array<{
    getUrl: (options?: { maxWidth?: number; maxHeight?: number }) => string;
  }>;
  place_id?: string;
  price?: string; // Price/rate information (e.g., "20k/Per month") - needs to come from backend API
  price_level?: number; // Google's price level (0-4: free, inexpensive, moderate, expensive, very expensive)
}

const NearbyPlaces = ({ location }: { location: Location }) => {
  const [distance, setDistance] = React.useState('');
  const [rating, setRating] = React.useState('');
  const [showHostels, setShowHostels] = React.useState(false);
  const [showRestaurants, setShowRestaurants] = React.useState(false);
  const [hostels, setHostels] = React.useState<GooglePlace[]>([]);
  const [restaurants, setRestaurants] = React.useState<GooglePlace[]>([]);
  const [loadingHostels, setLoadingHostels] = React.useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = React.useState(false);

  // Reset all state when location changes (e.g., when navigating to a different campus)
  useEffect(() => {
    setDistance('');
    setRating('');
    setShowHostels(false);
    setShowRestaurants(false);
    setHostels([]);
    setRestaurants([]);
  }, [location.latitude, location.longitude]);

  // Function to get place photo URL
  const getPlacePhotoUrl = (
    place: GooglePlace,
    fallbackImage: string
  ): string => {
    if (place.photos && place.photos.length > 0) {
      return place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
    }
    return fallbackImage;
  };

  const handleChange = (event: SelectChangeEvent) => {
    setDistance(event.target.value as string);
  };
  const handleRatingChange = (event: SelectChangeEvent) => {
    setRating(event.target.value as string);
  };

  const handleHostelsClick = async () => {
    setShowHostels(!showHostels);
    if (!showHostels) {
      await searchHostels();
    }
  };

  const handleRestaurantsClick = async () => {
    setShowRestaurants(!showRestaurants);
    if (!showRestaurants) {
      await searchRestaurants();
    }
  };

  // Function to search for nearby places using Google Places API
  const searchNearbyPlaces = async (
    type: string,
    radius: number,
    location: { lat: number; lng: number }
  ) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: radius * 1000, // Convert km to meters
        type: type,
        fields: [
          'name',
          'rating',
          'geometry',
          'types',
          'photos',
          'place_id',
          'price_level'
        ]
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results || []);
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      });
    });
  };

  // Function to search for hostels
  const searchHostels = async (forceRefresh = false) => {
    if (hostels.length > 0 && !forceRefresh) return; // Already loaded

    setLoadingHostels(true);
    try {
      const selectedDistanceKm = distance
        ? parseInt(distance.replace(/[^\d]/g, ''))
        : 10;

      const results = await searchNearbyPlaces('lodging', selectedDistanceKm, {
        lat: location.latitude,
        lng: location.longitude
      });

      // Filter for hostels specifically
      const hostelResults = (results as GooglePlace[]).filter(
        (place) =>
          place.name.toLowerCase().includes('hostel') ||
          place.types.includes('lodging')
      );

      // Debug: Log first result to see what data is available
      if (hostelResults.length > 0) {
        console.log('Sample hostel data:', hostelResults[0]);
        console.log('Available fields:', Object.keys(hostelResults[0]));
      }

      setHostels(hostelResults);
    } catch (error) {
      console.error('Error searching for hostels:', error);
    } finally {
      setLoadingHostels(false);
    }
  };

  // Function to search for restaurants
  const searchRestaurants = async (forceRefresh = false) => {
    if (restaurants.length > 0 && !forceRefresh) return; // Already loaded

    setLoadingRestaurants(true);
    try {
      // Use the selected distance for search radius
      const searchRadiusKm = distance
        ? parseInt(distance.replace(/[^\d]/g, ''))
        : 10;

      const results = await searchNearbyPlaces('restaurant', searchRadiusKm, {
        lat: location.latitude,
        lng: location.longitude
      });

      setRestaurants(results as GooglePlace[]);
    } catch (error) {
      console.error('Error searching for restaurants:', error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // Effect to re-search when distance changes
  useEffect(() => {
    if (showHostels) {
      // Force refresh when distance changes to get new data with updated radius
      searchHostels(true);
    }
    if (showRestaurants) {
      // Force refresh when distance changes to get new data with updated radius
      searchRestaurants(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distance]);

  // Helper function to calculate distance between two lat/lng points in km
  function getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  // Parse selected distance value (e.g. '1km' -> 1)
  const selectedDistanceKm = distance
    ? parseInt(distance.replace(/[^\d]/g, ''))
    : 10;

  // Filter places based on selected rating
  const selectedRating = rating && rating !== '' ? parseInt(rating) : null;

  // Debug logging

  const filteredHostels = hostels.filter((hostel) => {
    // Check distance filter first
    const distance = getDistanceFromLatLonInKm(
      location.latitude,
      location.longitude,
      hostel.geometry.location.lat(),
      hostel.geometry.location.lng()
    );
    const meetsDistance = distance <= selectedDistanceKm;

    // Check rating filter - show only ratings within the selected star range
    const meetsRating =
      selectedRating === null ||
      (hostel.rating &&
        hostel.rating >= selectedRating &&
        hostel.rating < selectedRating + 1);
    const shouldShow = meetsDistance && meetsRating;

    return shouldShow;
  });
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Check distance filter first
    const distance = getDistanceFromLatLonInKm(
      location.latitude,
      location.longitude,
      restaurant.geometry.location.lat(),
      restaurant.geometry.location.lng()
    );
    const meetsDistance = distance <= selectedDistanceKm;

    // Check rating filter - show only ratings within the selected star range
    const meetsRating =
      selectedRating === null ||
      (restaurant.rating &&
        restaurant.rating >= selectedRating &&
        restaurant.rating < selectedRating + 1);
    const shouldShow = meetsDistance && meetsRating;

    return shouldShow;
  });
  // Fixed heights for consistent layout
  const mapHeight = '500px';
  return (
    <WithPaper title="Nearby Places">
      <Stack spacing={3} mt={3}>
        {/* Filters Row */}
        <Stack
          direction="row"
          gap={2}
          flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
          sx={{ width: '100%' }}
        >
          <Button
            sx={{ px: 2.5, py: 1.25 }}
            size="small"
            variant={showHostels ? 'contained' : 'outlined'}
            onClick={handleHostelsClick}
            disabled={loadingHostels}
          >
            {loadingHostels ? 'Loading...' : 'Hostels'}
          </Button>
          <Button
            sx={{ px: 2.5, py: 1.25 }}
            size="small"
            variant={showRestaurants ? 'contained' : 'outlined'}
            onClick={handleRestaurantsClick}
            disabled={loadingRestaurants}
          >
            {loadingRestaurants ? 'Loading...' : 'Restaurants'}
          </Button>
          <SimpleSelect
            value={distance}
            handleChange={handleChange}
            options={DISTANCE_OPTIONS}
            label="Distance"
          />
          <SimpleSelect
            value={rating}
            handleChange={handleRatingChange}
            options={RATING_OPTIONS}
            label="Rating"
          />
        </Stack>

        {/* Map and Cards Container - Side by side on md+, stacked on small screens */}
        <Stack
          direction={{ xs: 'column', md: 'row-reverse' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          {/* Map */}
          <Box
            sx={{
              height: mapHeight,
              width: { xs: '100%', md: '50%' },
              flex: { xs: '0 0 auto', md: '1 1 50%' }
            }}
          >
            <GoogleMap
              center={{ lat: location.latitude, lng: location.longitude }}
              zoom={13}
              height={mapHeight}
              width="100%"
              radiusKm={
                showHostels || showRestaurants ? selectedDistanceKm : undefined
              }
              markers={[
                {
                  position: { lat: location.latitude, lng: location.longitude },
                  title: 'University Location',
                  info: 'Main campus building',
                  color: 'red'
                },
                ...(showHostels
                  ? filteredHostels.map((hostel) => ({
                      position: {
                        lat: hostel.geometry.location.lat(),
                        lng: hostel.geometry.location.lng()
                      },
                      title: hostel.name,
                      info: `Hostel - Rating: ${hostel.rating || 'N/A'}`,
                      color: 'blue'
                    }))
                  : []),
                ...(showRestaurants
                  ? filteredRestaurants.map((restaurant) => ({
                      position: {
                        lat: restaurant.geometry.location.lat(),
                        lng: restaurant.geometry.location.lng()
                      },
                      title: restaurant.name,
                      info: `Restaurant - Rating: ${restaurant.rating || 'N/A'}`,
                      color: 'green'
                    }))
                  : [])
              ]}
            />
          </Box>

          {/* Nearby Location Cards */}
          <Stack
            spacing={3}
            sx={{
              width: { xs: '100%', md: '50%' },
              flex: { xs: '0 0 auto', md: '1 1 50%' },
              height: { xs: '600px', md: 'auto' },
              maxHeight: { xs: '600px', md: '500px' },
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '3px',
                '&:hover': {
                  background: '#a8a8a8'
                }
              }
            }}
          >
            {/* Show hostels cards when hostels are visible */}
            {showHostels &&
              filteredHostels.map((hostel, index) => {
                const distance = getDistanceFromLatLonInKm(
                  location.latitude,
                  location.longitude,
                  hostel.geometry.location.lat(),
                  hostel.geometry.location.lng()
                );

                const placeInfoItems = [
                  {
                    id: 1,
                    title: `${distance.toFixed(1)}km away`,
                    image: '/assets/svg/location-blue.svg'
                  }
                ];

                // Add price if available
                // Note: Google Places API doesn't provide price strings automatically
                // Price data must come from your backend API or database mapping place_id to prices
                if (hostel.price) {
                  placeInfoItems.push({
                    id: 2,
                    title: hostel.price,
                    image: '/assets/svg/house.svg'
                  });
                } else {
                  // Debug: Log when price is missing to help identify the issue
                  console.log(
                    `Price not available for: ${hostel.name} (place_id: ${hostel.place_id})`
                  );
                }

                // Add rating
                placeInfoItems.push({
                  id: placeInfoItems.length + 1,
                  title: hostel.rating ? `${hostel.rating} stars` : 'No rating',
                  image: '/assets/svg/star.svg'
                });

                return (
                  <NearByPlaceCard
                    key={`hostel-${index}`}
                    title={hostel.name}
                    image={getPlacePhotoUrl(hostel, '/assets/png/hostal.png')}
                    destinationLat={hostel.geometry.location.lat()}
                    destinationLng={hostel.geometry.location.lng()}
                    placeInfo={placeInfoItems}
                  />
                );
              })}

            {/* Show restaurants cards when restaurants are visible */}
            {showRestaurants &&
              filteredRestaurants.map((restaurant, index) => {
                const distance = getDistanceFromLatLonInKm(
                  location.latitude,
                  location.longitude,
                  restaurant.geometry.location.lat(),
                  restaurant.geometry.location.lng()
                );

                const restaurantPlaceInfoItems = [
                  {
                    id: 1,
                    title: `${distance.toFixed(1)}km away`,
                    image: '/assets/svg/location-blue.svg'
                  }
                ];

                // Add price if available
                // Note: Google Places API doesn't provide price strings automatically
                // Price data must come from your backend API or database mapping place_id to prices
                if (restaurant.price) {
                  restaurantPlaceInfoItems.push({
                    id: 2,
                    title: restaurant.price,
                    image: '/assets/svg/house.svg'
                  });
                } else {
                  // Debug: Log when price is missing to help identify the issue
                  console.log(
                    `Price not available for: ${restaurant.name} (place_id: ${restaurant.place_id})`
                  );
                }

                // Add rating
                restaurantPlaceInfoItems.push({
                  id: restaurantPlaceInfoItems.length + 1,
                  title: restaurant.rating
                    ? `${restaurant.rating} stars`
                    : 'No rating',
                  image: '/assets/svg/star.svg'
                });

                return (
                  <NearByPlaceCard
                    key={`restaurant-${index}`}
                    title={restaurant.name}
                    image={getPlacePhotoUrl(
                      restaurant,
                      '/assets/png/restaurant.png'
                    )}
                    destinationLat={restaurant.geometry.location.lat()}
                    destinationLng={restaurant.geometry.location.lng()}
                    placeInfo={restaurantPlaceInfoItems}
                  />
                );
              })}

            {/* Show message when no places are selected */}
            {!showHostels && !showRestaurants && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Click on &quot;Hostels&quot; or &quot;Restaurants&quot; to see
                  nearby places
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Stack>
    </WithPaper>
  );
};

export default NearbyPlaces;
