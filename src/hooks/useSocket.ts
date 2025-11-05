"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  initNotificationSocket,
  initPaymentSocket,
  initAllSockets,
  disconnectSocket,
  disconnectAllSockets,
  getSocket,
  isSocketConnected,
  getSocketStatus,
  getAllSocketStatus,
  subscribeToNotifications,
  subscribeToNotificationUpdates,
  subscribeToPaymentUpdates,
  subscribeToPaymentStatus,
  subscribeToPaymentSuccess,
  subscribeToPaymentFailure,
  unsubscribeFromNotifications,
  unsubscribeFromNotificationUpdates,
  unsubscribeFromPaymentUpdates,
  performSocketHealthCheck,
  type SocketType,
  type SocketStatus,
} from '@/lib/socket-IOClient';

/**
 * Custom hook for managing Socket.IO connections in React components
 * 
 * Features:
 * - Automatic connection management based on authentication
 * - Separate notification and payment socket handling
 * - Cleanup on component unmount
 * - TypeScript support
 */

interface UseSocketOptions {
  /**
   * Which sockets to initialize
   * - 'notifications': Only notification socket (port 9092)
   * - 'payments': Only payment socket (port 9093)
   * - 'both': Both sockets
   */
  sockets?: 'notifications' | 'payments' | 'both';
  
  /**
   * Auto-connect when session is available
   */
  autoConnect?: boolean;
  
  /**
   * Enable debug logging
   */
  debug?: boolean;
}

interface UseSocketReturn {
  // Connection methods
  connectNotifications: () => void;
  connectPayments: () => void;
  connectAll: () => void;
  disconnect: (type?: SocketType) => void;
  disconnectAll: () => void;
  
  // Status methods
  isNotificationConnected: boolean;
  isPaymentConnected: boolean;
  notificationStatus: SocketStatus | null;
  paymentStatus: SocketStatus | null;
  
  // Subscription methods
  subscribeToNotifications: (callback: (data: any) => void) => void;
  subscribeToNotificationUpdates: (callback: (data: any) => void) => void;
  subscribeToPaymentUpdates: (callback: (data: any) => void) => void;
  subscribeToPaymentStatus: (callback: (data: any) => void) => void;
  subscribeToPaymentSuccess: (callback: (data: any) => void) => void;
  subscribeToPaymentFailure: (callback: (data: any) => void) => void;
  
  // Utility methods
  healthCheck: () => void;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const {
    sockets = 'notifications',
    autoConnect = true,
    debug = false,
  } = options;
  
  const { data: session, status } = useSession();
  const isInitialized = useRef(false);
  
  // Debug logging
  const log = useCallback((...args: any[]) => {
    if (debug) {
      console.log('[useSocket]', ...args);
    }
  }, [debug]);
  
  // Connection methods
  const connectNotifications = useCallback(() => {
    if (session?.accessToken) {
      log('Connecting to notification socket');
      initNotificationSocket(session.accessToken);
    } else {
      log('Cannot connect notifications: no access token');
    }
  }, [session?.accessToken, log]);
  
  const connectPayments = useCallback(() => {
    if (session?.accessToken) {
      log('Connecting to payment socket');
      initPaymentSocket(session.accessToken);
    } else {
      log('Cannot connect payments: no access token');
    }
  }, [session?.accessToken, log]);
  
  const connectAll = useCallback(() => {
    if (session?.accessToken) {
      log('Connecting to all sockets');
      initAllSockets(session.accessToken);
    } else {
      log('Cannot connect all: no access token');
    }
  }, [session?.accessToken, log]);
  
  const disconnect = useCallback((type?: SocketType) => {
    if (type) {
      log(`Disconnecting ${type} socket`);
      disconnectSocket(type);
    } else {
      log('Disconnecting all sockets');
      disconnectAllSockets();
    }
  }, [log]);
  
  const disconnectAll = useCallback(() => {
    log('Disconnecting all sockets');
    disconnectAllSockets();
  }, [log]);
  
  // Auto-connection effect
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && autoConnect && !isInitialized.current) {
      log('Auto-connecting sockets:', sockets);
      
      switch (sockets) {
        case 'notifications':
          connectNotifications();
          break;
        case 'payments':
          connectPayments();
          break;
        case 'both':
          connectAll();
          break;
      }
      
      isInitialized.current = true;
    }
  }, [status, session?.accessToken, autoConnect, sockets, connectNotifications, connectPayments, connectAll, log]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      log('Component unmounting, cleaning up sockets');
      disconnectAllSockets();
      isInitialized.current = false;
    };
  }, [log]);
  
  // Status getters
  const isNotificationConnected = isSocketConnected('notifications');
  const isPaymentConnected = isSocketConnected('payments');
  const notificationStatus = getSocketStatus('notifications');
  const paymentStatus = getSocketStatus('payments');
  
  // Subscription methods with cleanup
  const subscribeToNotificationsWrapper = useCallback((callback: (data: any) => void) => {
    subscribeToNotifications(callback);
    
    // Return cleanup function
    return () => {
      unsubscribeFromNotifications();
    };
  }, []);
  
  const subscribeToNotificationUpdatesWrapper = useCallback((callback: (data: any) => void) => {
    subscribeToNotificationUpdates(callback);
    
    return () => {
      unsubscribeFromNotificationUpdates();
    };
  }, []);
  
  const subscribeToPaymentUpdatesWrapper = useCallback((callback: (data: any) => void) => {
    subscribeToPaymentUpdates(callback);
    
    return () => {
      unsubscribeFromPaymentUpdates();
    };
  }, []);
  
  const subscribeToPaymentStatusWrapper = useCallback((callback: (data: any) => void) => {
    subscribeToPaymentStatus(callback);
    
    return () => {
      unsubscribeFromPaymentUpdates();
    };
  }, []);
  
  const subscribeToPaymentSuccessWrapper = useCallback((callback: (data: any) => void) => {
    subscribeToPaymentSuccess(callback);
    
    return () => {
      unsubscribeFromPaymentUpdates();
    };
  }, []);
  
  const subscribeToPaymentFailureWrapper = useCallback((callback: (data: any) => void) => {
    subscribeToPaymentFailure(callback);
    
    return () => {
      unsubscribeFromPaymentUpdates();
    };
  }, []);
  
  const healthCheck = useCallback(() => {
    performSocketHealthCheck();
  }, []);
  
  return {
    // Connection methods
    connectNotifications,
    connectPayments,
    connectAll,
    disconnect,
    disconnectAll,
    
    // Status
    isNotificationConnected,
    isPaymentConnected,
    notificationStatus,
    paymentStatus,
    
    // Subscription methods
    subscribeToNotifications: subscribeToNotificationsWrapper,
    subscribeToNotificationUpdates: subscribeToNotificationUpdatesWrapper,
    subscribeToPaymentUpdates: subscribeToPaymentUpdatesWrapper,
    subscribeToPaymentStatus: subscribeToPaymentStatusWrapper,
    subscribeToPaymentSuccess: subscribeToPaymentSuccessWrapper,
    subscribeToPaymentFailure: subscribeToPaymentFailureWrapper,
    
    // Utility methods
    healthCheck,
  };
};

/**
 * Hook for notification-only socket management
 */
export const useNotificationSocket = (options: Omit<UseSocketOptions, 'sockets'> = {}) => {
  return useSocket({ ...options, sockets: 'notifications' });
};

/**
 * Hook for payment-only socket management
 */
export const usePaymentSocket = (options: Omit<UseSocketOptions, 'sockets'> = {}) => {
  return useSocket({ ...options, sockets: 'payments' });
};

/**
 * Hook for both notification and payment socket management
 */
export const useAllSockets = (options: Omit<UseSocketOptions, 'sockets'> = {}) => {
  return useSocket({ ...options, sockets: 'both' });
};
