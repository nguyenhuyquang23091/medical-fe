import { io, Socket } from "socket.io-client";
import { WEBSOCKET_URLS } from "./config/configuration";


// Socket instances
let notificationSocket: Socket | null = null;
let paymentSocket: Socket | null = null;

// Socket types for type safety
export type SocketType = 'notifications' | 'payments';

// Socket connection status interface
export interface SocketStatus {
  connected: boolean;
  id: string | null;
  url: string;
  type: SocketType;
}

/**
 * Initialize notification socket (port 9092)
 * Handles: general notifications, system messages, prescription updates
 */
export const initNotificationSocket = (token: string): Socket => {
  if (!notificationSocket || !notificationSocket.connected) {
    if (notificationSocket) {
      notificationSocket.disconnect();
      notificationSocket = null;
    }

    console.log('🔔 Initializing notification socket on port 9092');
    
    notificationSocket = io(WEBSOCKET_URLS.NOTIFICATIONS, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Notification socket event handlers
    notificationSocket.on('connect', () => {
      console.log('✅ Notification socket connected:', notificationSocket?.id);
    });

    notificationSocket.on('disconnect', (reason) => {
      console.log('❌ Notification socket disconnected:', reason);
    });

    notificationSocket.on('connect_error', (error) => {
      console.error('🔔 Notification socket connection error:', error.message);
    });

    notificationSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Notification socket reconnected after', attemptNumber, 'attempts');
    });
  }

  return notificationSocket;
};

/**
 * Initialize payment socket (port 9093)
 * Handles: payment status updates, transaction responses
 */
export const initPaymentSocket = (token: string): Socket => {
  if (!paymentSocket || !paymentSocket.connected) {
    if (paymentSocket) {
      paymentSocket.disconnect();
      paymentSocket = null;
    }

    console.log('💳 Initializing payment socket on port 9093');
    
    paymentSocket = io(WEBSOCKET_URLS.PAYMENTS, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Payment socket event handlers
    paymentSocket.on('connect', () => {
      console.log('✅ Payment socket connected:', paymentSocket?.id);
    });

    paymentSocket.on('disconnect', (reason) => {
      console.log('❌ Payment socket disconnected:', reason);
    });

    paymentSocket.on('connect_error', (error) => {
      console.error('💳 Payment socket connection error:', error.message);
    });

    paymentSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Payment socket reconnected after', attemptNumber, 'attempts');
    });
  }

  return paymentSocket;
};

/**
 * Initialize both sockets simultaneously
 * Convenient method for components that need both notification and payment updates
 */
export const initAllSockets = (token: string): { notifications: Socket; payments: Socket } => {
  const notifications = initNotificationSocket(token);
  const payments = initPaymentSocket(token);
  
  console.log('🚀 All sockets initialized');
  
  return { notifications, payments };
};

/**
 * Legacy method - maintains backward compatibility
 * Defaults to notification socket for existing code
 */
export const initSocketIo = (token: string): Socket => {
  console.log('⚠️ Using legacy initSocketIo - consider using initNotificationSocket or initPaymentSocket');
  return initNotificationSocket(token);
};

/**
 * Disconnect specific socket
 */
export const disconnectSocket = (type: SocketType): void => {
  switch (type) {
    case 'notifications':
      if (notificationSocket) {
        console.log('🔔 Disconnecting notification socket');
        notificationSocket.disconnect();
        notificationSocket = null;
      }
      break;
    case 'payments':
      if (paymentSocket) {
        console.log('💳 Disconnecting payment socket');
        paymentSocket.disconnect();
        paymentSocket = null;
      }
      break;
  }
};

/**
 * Disconnect all sockets
 */
export const disconnectAllSockets = (): void => {
  disconnectSocket('notifications');
  disconnectSocket('payments');
  console.log('🔌 All sockets disconnected');
};

/**
 * Legacy method - maintains backward compatibility
 */
export const socketDisconnect = (): void => {
  console.log('⚠️ Using legacy socketDisconnect - consider using disconnectSocket or disconnectAllSockets');
  disconnectSocket('notifications');
};

/**
 * Get specific socket instance
 */
export const getSocket = (type: SocketType): Socket | null => {
  switch (type) {
    case 'notifications':
      return notificationSocket;
    case 'payments':
      return paymentSocket;
    default:
      return null;
  }
};

/**
 * Legacy method - returns notification socket for backward compatibility
 */
export const getLegacySocket = (): Socket | null => {
  console.log('⚠️ Using legacy getSocket - consider using getSocket with type parameter');
  return notificationSocket;
};

/**
 * Check if specific socket is connected
 */
export const isSocketConnected = (type: SocketType): boolean => {
  const socket = getSocket(type);
  return socket?.connected || false;
};

/**
 * Get status of specific socket
 */
export const getSocketStatus = (type: SocketType): SocketStatus => {
  const socket = getSocket(type);
  const urls = {
    notifications: WEBSOCKET_URLS.NOTIFICATIONS,
    payments: WEBSOCKET_URLS.PAYMENTS,
  };
  
  return {
    connected: socket?.connected || false,
    id: socket?.id || null,
    url: urls[type],
    type,
  };
};

/**
 * Get status of all sockets
 */
export const getAllSocketStatus = (): { notifications: SocketStatus; payments: SocketStatus } => {
  return {
    notifications: getSocketStatus('notifications'),
    payments: getSocketStatus('payments'),
  };
};

// ==================== NOTIFICATION SOCKET METHODS ====================

/**
 * Subscribe to notification events (port 9092)
 */
export const subscribeToNotifications = (callback: (data: any) => void): void => {
  if (notificationSocket) {
    notificationSocket.off('notification');
    notificationSocket.on('notification', (data) => {
      try {
        console.log('🔔 Received notification:', data);
        callback(data);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  } else {
    console.warn('Notification socket not initialized. Call initNotificationSocket first.');
  }
};

/**
 * Subscribe to notification updates (port 9092)
 */
export const subscribeToNotificationUpdates = (callback: (data: any) => void): void => {
  if (notificationSocket) {
    notificationSocket.off('notification_update');
    notificationSocket.on('notification_update', (data) => {
      try {
        console.log('🔔 Received notification update:', data);
        callback(data);
      } catch (error) {
        console.error('Error in notification_update callback:', error);
      }
    });
  } else {
    console.warn('Notification socket not initialized. Call initNotificationSocket first.');
  }
};

/**
 * Unsubscribe from notification events
 */
export const unsubscribeFromNotifications = (): void => {
  if (notificationSocket) {
    notificationSocket.off('notification');
    console.log('🔔 Unsubscribed from notifications');
  }
};

/**
 * Unsubscribe from notification updates
 */
export const unsubscribeFromNotificationUpdates = (): void => {
  if (notificationSocket) {
    notificationSocket.off('notification_update');
    console.log('🔔 Unsubscribed from notification updates');
  }
};

// ==================== PAYMENT SOCKET METHODS ====================

/**
 * Subscribe to payment updates (port 9093)
 */
export const subscribeToPaymentUpdates = (callback: (data: any) => void): void => {
  if (paymentSocket) {
    paymentSocket.off('payment:update');
    paymentSocket.on('payment:update', (data) => {
      try {
        console.log('💳 Received payment update:', data);
        callback(data);
      } catch (error) {
        console.error('Error in payment:update callback:', error);
      }
    });
  } else {
    console.warn('Payment socket not initialized. Call initPaymentSocket first.');
  }
};

/**
 * Subscribe to payment status changes (port 9093)
 */
export const subscribeToPaymentStatus = (callback: (data: any) => void): void => {
  if (paymentSocket) {
    paymentSocket.off('payment:status');
    paymentSocket.on('payment:status', (data) => {
      try {
        console.log('💳 Received payment status:', data);
        callback(data);
      } catch (error) {
        console.error('Error in payment:status callback:', error);
      }
    });
  } else {
    console.warn('Payment socket not initialized. Call initPaymentSocket first.');
  }
};

/**
 * Subscribe to payment success events (port 9093)
 */
export const subscribeToPaymentSuccess = (callback: (data: any) => void): void => {
  if (paymentSocket) {
    paymentSocket.off('payment:success');
    paymentSocket.on('payment:success', (data) => {
      try {
        console.log('✅ Payment successful:', data);
        callback(data);
      } catch (error) {
        console.error('Error in payment:success callback:', error);
      }
    });
  } else {
    console.warn('Payment socket not initialized. Call initPaymentSocket first.');
  }
};

/**
 * Subscribe to payment failure events (port 9093)
 */
export const subscribeToPaymentFailure = (callback: (data: any) => void): void => {
  if (paymentSocket) {
    paymentSocket.off('payment:failure');
    paymentSocket.on('payment:failure', (data) => {
      try {
        console.log('❌ Payment failed:', data);
        callback(data);
      } catch (error) {
        console.error('Error in payment:failure callback:', error);
      }
    });
  } else {
    console.warn('Payment socket not initialized. Call initPaymentSocket first.');
  }
};

/**
 * Unsubscribe from all payment events
 */
export const unsubscribeFromPaymentUpdates = (): void => {
  if (paymentSocket) {
    paymentSocket.off('payment:update');
    paymentSocket.off('payment:status');
    paymentSocket.off('payment:success');
    paymentSocket.off('payment:failure');
    console.log('💳 Unsubscribed from all payment events');
  }
};

// ==================== UTILITY METHODS ====================

/**
 * Emit event to specific socket
 */
export const emitToSocket = (type: SocketType, event: string, data?: any): void => {
  const socket = getSocket(type);
  if (socket && socket.connected) {
    socket.emit(event, data);
    console.log(`📤 Emitted ${event} to ${type} socket:`, data);
  } else {
    console.warn(`Cannot emit ${event}: ${type} socket not connected`);
  }
};

/**
 * Health check for all sockets
 */
export const performSocketHealthCheck = (): { notifications: SocketStatus; payments: SocketStatus } => {
  const status = getAllSocketStatus();
  
  console.log('🏥 Socket Health Check:');
  console.log('  Notifications:', status.notifications.connected ? '✅ Connected' : '❌ Disconnected');
  console.log('  Payments:', status.payments.connected ? '✅ Connected' : '❌ Disconnected');
  
  return status;
};