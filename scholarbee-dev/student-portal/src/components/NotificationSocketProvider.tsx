/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState, useRef } from 'react';
import {
  getNotificationSocket,
  getChatSocketWithHandlers,
  clearSocketInstances,
  isSocketConnected
} from '@/lib/socket';
import Cookies from 'js-cookie';
import { useGetNotificationsQuery } from '@/redux/api/notificationsApi';

const SocketProvider = () => {
  const [notificationsInitialized, setNotificationsInitialized] =
    useState(false);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketInitializedRef = useRef(false);
  const chatSocketInitializedRef = useRef(false);
  const token = Cookies.get('access_token');

  // Ensure the notifications are pre-loaded to populate the store
  // This ensures we have a valid query cache to update when socket messages arrive
  const { isSuccess: notificationsLoaded } = useGetNotificationsQuery(
    {
      read_status: 'any',
      isCritical: false // Don't redirect users to login from socket provider
    },
    {
      // Skip the query if the user is not logged in
      skip: !token
    }
  );

  useEffect(() => {
    if (notificationsLoaded && !notificationsInitialized && token) {
      console.log('🛎️ Socket initialization after notifications loaded');
      setNotificationsInitialized(true);

      try {
        if (!socketInitializedRef.current) {
          socketInitializedRef.current = true;
          getNotificationSocket();
        }

        if (!chatSocketInitializedRef.current) {
          chatSocketInitializedRef.current = true;
          getChatSocketWithHandlers();
        }
      } catch (error) {
        console.error('Failed to initialize sockets:', error);
        socketInitializedRef.current = false;
        chatSocketInitializedRef.current = false;
      }
    }
  }, [notificationsLoaded, notificationsInitialized, token]);

  // Main socket connection management
  useEffect(() => {
    if (typeof window === 'undefined' || !token) {
      return;
    }

    // Only initialize if not already connected
    if (!isSocketConnected() && !socketInitializedRef.current) {
      try {
        socketInitializedRef.current = true;
        getNotificationSocket();
      } catch (error) {
        console.error('Error initializing notification socket:', error);
        socketInitializedRef.current = false;
      }
    }

    // Initialize chat socket if not already done
    if (!chatSocketInitializedRef.current) {
      try {
        chatSocketInitializedRef.current = true;
        getChatSocketWithHandlers();
      } catch (error) {
        console.error('Error initializing chat socket:', error);
        chatSocketInitializedRef.current = false;
      }
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        if (event.newValue) {
          clearSocketInstances();
          socketInitializedRef.current = false;
          chatSocketInitializedRef.current = false;
          setTimeout(() => {
            try {
              socketInitializedRef.current = true;
              chatSocketInitializedRef.current = true;
              getNotificationSocket();
              getChatSocketWithHandlers();
            } catch (error) {
              console.error(
                'Error reinitializing sockets after token change:',
                error
              );
              socketInitializedRef.current = false;
              chatSocketInitializedRef.current = false;
            }
          }, 500);
        } else {
          clearSocketInstances();
          socketInitializedRef.current = false;
          chatSocketInitializedRef.current = false;
        }
      } else if (event.key === 'refresh_token' && !event.newValue) {
        clearSocketInstances();
        socketInitializedRef.current = false;
        chatSocketInitializedRef.current = false;
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Implement a more controlled reconnection strategy
    reconnectIntervalRef.current = setInterval(() => {
      const currentToken = Cookies.get('access_token');
      if (currentToken && !isSocketConnected()) {
        clearSocketInstances();
        socketInitializedRef.current = false;
        chatSocketInitializedRef.current = false;
        setTimeout(() => {
          try {
            socketInitializedRef.current = true;
            chatSocketInitializedRef.current = true;
            getNotificationSocket();
            getChatSocketWithHandlers();
          } catch (error) {
            console.error('Error in reconnection attempt:', error);
            socketInitializedRef.current = false;
            chatSocketInitializedRef.current = false;
          }
        }, 500);
      }
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
    };
  }, [token]);

  return null;
};

export default SocketProvider;
