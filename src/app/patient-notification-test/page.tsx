"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { initSocketIo, subscribeToNotifications, unsubscribeFromNotifications, socketDisconnect, isSocketConnected, getSocketStatus } from '@/lib/socket-IOClient';
import { NotificationMessage } from '@/types/notification';
import { toast } from 'sonner';
import prescriptionService from '@/actions/profile/prescription';
import { PrescriptionAccessData } from '@/types/prescription';

export default function PatientNotificationTestPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');

  // Initialize Socket.IO connection when user is authenticated
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    console.log('User ID:', session?.user?.id);
    console.log('Access token exists:', !!session?.accessToken);
    
    if (status === 'authenticated' && session?.accessToken) {
      console.log('✅ Authentication check passed - Initializing Socket.IO for PATIENT user');

      console.log('🔍 DEBUG: Patient User ID for Socket connection:', session.user?.id);
      initSocketIo(session.accessToken);
    } else if (status === 'authenticated') {
      console.log('⚠️ Authenticated but missing access token');
      console.log('- Access Token:', session?.accessToken ? 'EXISTS' : 'MISSING');
      setConnectionStatus('Authentication Error: Missing access token');
    } else if (status === 'unauthenticated') {
      console.log('❌ User not authenticated');
      setConnectionStatus('Not authenticated');
    } else {
      console.log('⏳ Authentication loading...');
      setConnectionStatus('Loading authentication...');
    }

    // Try to initialize with existing connection if available
    if (status === 'authenticated' && session?.accessToken) {
      const socket = initSocketIo(session.accessToken);

      if (socket) {
        // Check if socket is already connected
        const currentlyConnected = socket.connected;
        console.log('Socket connection state:', currentlyConnected);
        
        setIsConnected(currentlyConnected);
        setConnectionStatus(currentlyConnected ? 'Connected' : 'Connecting...');

        // Monitor connection status - remove existing listeners first to avoid duplicates
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('reconnect');

        socket.on('connect', () => {
          setIsConnected(true);
          setConnectionStatus('Connected');
          console.log('Socket.IO connected - ready to receive notifications');
        });

        socket.on('disconnect', (reason) => {
          setIsConnected(false);
          setConnectionStatus(`Disconnected: ${reason}`);
          console.log('Socket.IO disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
          setConnectionStatus(`Connection Error: ${error.message}`);
          console.error('Socket.IO connection error:', error);
        });

        socket.on('reconnect', (attemptNumber) => {
          setIsConnected(true);
          setConnectionStatus('Reconnected');
          console.log(`Reconnected after ${attemptNumber} attempts`);
        });

        // Subscribe to notifications
        subscribeToNotifications(handleNotification);
      }

      // Update connection status periodically to catch any changes
      const statusInterval = setInterval(() => {
        const status = getSocketStatus();
        setIsConnected(status.connected);
        if (status.connected && connectionStatus.includes('Disconnected')) {
          setConnectionStatus('Connected');
          console.log('Socket status updated - now connected:', status);
        }
      }, 1000);

      return () => {
        clearInterval(statusInterval);
      };
    }

    return () => {
      if (status === 'unauthenticated') {
        console.log('User logged out, disconnecting Socket.IO');
        unsubscribeFromNotifications();
        socketDisconnect();
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        setNotifications([]);
      }
    };
  }, [status, session?.accessToken]);

  // Handle incoming notifications
  const handleNotification = (notification: NotificationMessage) => {
    console.log('Received notification:', notification);

    // Add timestamp and id for UI purposes
    const notificationWithExtras = {
      ...notification,
      id: notification.requestId || `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Add to notifications list
    setNotifications(prev => [notificationWithExtras, ...prev]);

    // Show toast notification
    toast.info(`🔔 New Notification`, {
      description: notification.message,
      duration: 5000,
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const refreshConnectionStatus = () => {
    const status = getSocketStatus();
    setIsConnected(status.connected);
    setConnectionStatus(status.connected ? 'Connected' : 'Disconnected');
    console.log('Manual connection status refresh:', status);
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!session?.accessToken) {
      toast.error('Authentication required to approve request');
      return;
    }

    try {
      toast.loading('Approving request...', { id: `approve-${requestId}` });

      const result = await prescriptionService.approveDoctorRequest(requestId, session.accessToken);

      toast.success('Request approved successfully!', {
        id: `approve-${requestId}`,
        description: 'Doctor now has access to your prescription'
      });

      // Update the notification status in the UI
      setNotifications(prev =>
        prev.map(notification =>
          notification.requestId === requestId
            ? { ...notification, isApproved: true }
            : notification
        )
      );

      console.log('Approval result:', result);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request', {
        id: `approve-${requestId}`,
        description: 'Please try again later'
      });
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    if (!session?.accessToken) {
      toast.error('Authentication required to deny request');
      return;
    }

    try {
      toast.loading('Denying request...', { id: `deny-${requestId}` });

      const result = await prescriptionService.denyDoctorRequest(requestId, session.accessToken);

      toast.success('Request denied successfully!', {
        id: `deny-${requestId}`,
        description: 'Doctor access request has been denied'
      });

      // Update the notification status in the UI
      setNotifications(prev =>
        prev.map(notification =>
          notification.requestId === requestId
            ? { ...notification, isDenied: true }
            : notification
        )
      );

      console.log('Deny result:', result);
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request', {
        id: `deny-${requestId}`,
        description: 'Please try again later'
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in with PATIENT role to test real-time notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Notification Test</h1>
        <p className="text-gray-600 text-lg">Real-time notification testing for PATIENT role</p>
        <div className="flex justify-center gap-4 mt-4">
          <Badge variant="outline">
            User ID: {session.user?.id || 'Unknown'}
          </Badge>
          <Badge variant="outline">
            Role: PATIENT
          </Badge>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {connectionStatus}
          </Badge>
        </div>
      </div>

      {/* Connection Status */}
      <Card className={`${isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={`${isConnected ? 'text-green-800' : 'text-red-800'}`}>
              Socket.IO Connection Status
            </CardTitle>
            <Button 
              onClick={refreshConnectionStatus} 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              Refresh Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`${isConnected ? 'text-green-700' : 'text-red-700'}`}>
              {connectionStatus}
            </span>
          </div>
          {isConnected && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Ready to receive real-time notifications from doctors
            </p>
          )}
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>WebSocket URL:</strong> http://localhost:9092</p>
            <p><strong>User ID:</strong> {session.user?.id}</p>
            <p><strong>Role:</strong> PATIENT</p>
          </div>
        </CardContent>
      </Card>

      {/* Received Notifications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Received Notifications ({notifications.length})</CardTitle>
            {notifications.length > 0 && (
              <Button onClick={clearNotifications} variant="outline" size="sm">
                Clear All
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Notifications received in real-time from the WebSocket server
          </p>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No notifications received yet</p>
              <p className="text-sm">
                Waiting for real-time notifications from doctors...
              </p>
              <p className="text-xs mt-4 text-gray-400">
                Use the doctor test page to send prescription access requests to see notifications here
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={`${notification.requestId || Date.now()}`}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        {notification.notificationType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {(notification as any).isApproved
                          ? 'APPROVED'
                          : (notification as any).isDenied
                          ? 'DENIED'
                          : 'NEW'}
                      </Badge>
                    </div>

                    {notification.notificationType === 'ACCESS_REQUEST' &&
                     !(notification as any).isApproved &&
                     !(notification as any).isDenied &&
                     notification.requestId && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveRequest(notification.requestId!)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDenyRequest(notification.requestId!)}
                          size="sm"
                          variant="destructive"
                        >
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-800">
                      {notification.message}
                    </p>

                    {notification.prescriptionName && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-base font-medium text-blue-900">
                          {notification.prescriptionName}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Request ID: {notification.requestId}</span>
                      {notification.prescriptionId && (
                        <span>Prescription ID: {notification.prescriptionId}</span>
                      )}
                    </div>

                    <p className="text-xs text-blue-600">
                      Recipient: {notification.recipientId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>How to Test Real-time Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold">Step 1: Ensure Connection</h4>
            <p className="text-gray-600">
              Make sure the connection status above shows "Connected". If not, check that your WebSocket server is running on port 9092.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Step 2: Use Doctor Test Page</h4>
            <p className="text-gray-600">
              Open the doctor prescription test page in another browser tab/window and use the "Request Access" functionality to send notifications to this patient.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Step 3: Watch for Notifications</h4>
            <p className="text-gray-600">
              • Real-time notifications will appear in the list above<br/>
              • Toast notifications will show in the top-right corner<br/>
              • All notifications are logged to the browser console
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600">Expected Notification Types:</h4>
            <ul className="text-gray-600 list-disc list-inside space-y-1">
              <li><strong>PRESCRIPTION_ACCESS_REQUEST</strong> - When doctors request access to your prescriptions</li>
              <li><strong>PRESCRIPTION_ACCESS_APPROVED</strong> - When your prescription access is approved</li>
              <li><strong>PRESCRIPTION_ACCESS_DENIED</strong> - When your prescription access is denied</li>
              <li><strong>PRESCRIPTION_UPDATED</strong> - When your prescriptions are updated</li>
              <li><strong>PRESCRIPTION_CREATED</strong> - When new prescriptions are created for you</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
