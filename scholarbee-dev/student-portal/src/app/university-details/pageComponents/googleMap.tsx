'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Box, Typography, CircularProgress } from '@mui/material';
import { GOOGLE_MAPS_API_KEY } from '@/config/config';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    info?: string;
    color?: string;
  }>;
  height?: string | number;
  width?: string | number;
  radiusKm?: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 40.7128, lng: -74.006 }, // Default to New York
  zoom = 13,
  markers = [],
  height = '400px',
  width = '100%',
  radiusKm
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error('Google Maps API key is not configured');
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          setMap(mapInstance);

          // Draw radius circle if provided
          if (radiusKm && radiusKm > 0) {
            new google.maps.Circle({
              strokeColor: '#1E88E5',
              strokeOpacity: 0.6,
              strokeWeight: 2,
              fillColor: '#1E88E5',
              fillOpacity: 0.08,
              map: mapInstance,
              center,
              radius: radiusKm * 1000 // meters
            });
          }

          // Add markers
          markers.forEach((markerData) => {
            const marker = new google.maps.Marker({
              position: markerData.position,
              map: mapInstance,
              title: markerData.title || 'Location',
              icon: markerData.color
                ? {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${markerData.color}"/>
                      </svg>
                    `)}`,
                    scaledSize: new google.maps.Size(24, 24),
                    anchor: new google.maps.Point(12, 24)
                  }
                : undefined
            });

            // Add info window if info is provided
            if (markerData.info) {
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="padding: 10px; max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                      ${markerData.title || 'Location'}
                    </h3>
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      ${markerData.info}
                    </p>
                  </div>
                `
              });

              marker.addListener('click', () => {
                infoWindow.open(mapInstance, marker);
              });
            }
          });
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, [center, zoom, markers, radiusKm]);

  if (error) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography color="error" variant="body2" textAlign="center">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            zIndex: 1
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}
      <div
        ref={mapRef}
        style={{
          width: width,
          height: height,
          borderRadius: '4px',
          flex: 1
        }}
      />
    </Box>
  );
};

export default GoogleMap;
