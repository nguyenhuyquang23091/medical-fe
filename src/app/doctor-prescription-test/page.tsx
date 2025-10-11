"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import prescriptionService from '@/actions/profile/prescription';
import { PrescriptionGeneralData, PrescriptionAccessData } from '@/types/prescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { initSocketIo, socketDisconnect, getSocketStatus, isSocketConnected, subscribeToNotifications, unsubscribeFromNotifications } from '@/lib/socket-IOClient';
import { NotificationMessage } from '@/types/notification';
import { toast } from 'sonner';

export default function DoctorPrescriptionTestPage() {
  const { data: session, status } = useSession();

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
          <p className="text-gray-600">Please sign in to access this doctor test page.</p>
        </div>
      </div>
    );
  }

  const [patientPrescriptions, setPatientPrescriptions] = useState<PrescriptionGeneralData[]>([]);
  const [accessRequest, setAccessRequest] = useState<PrescriptionAccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  // Form states for getting patient prescriptions
  const [patientId, setPatientId] = useState('');

  // Form states for requesting prescription access
  const [accessForm, setAccessForm] = useState({
    patientId: '',
    prescriptionId: '',
    requestReason: 'Medical consultation and treatment planning'
  });

  // Initialize Socket.IO connection when user is authenticated
  useEffect(() => {
    console.log('Doctor - Session status:', status);
    console.log('Doctor - Session data:', session);
    console.log('Doctor - User ID:', session?.user?.id);
    console.log('Doctor - Access token exists:', !!session?.accessToken);

    if (status === 'authenticated' && session?.accessToken) {
      console.log('✅ Doctor - Authentication check passed - Initializing Socket.IO for DOCTOR user');

      const socket = initSocketIo(session.accessToken);

      if (socket) {
        // Check if socket is already connected
        const currentlyConnected = socket.connected;
        console.log('Doctor - Socket connection state:', currentlyConnected);

        setIsSocketConnected(currentlyConnected);
        setConnectionStatus(currentlyConnected ? 'Connected' : 'Connecting...');

        // Monitor connection status - remove existing listeners first to avoid duplicates
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('reconnect');

        socket.on('connect', () => {
          setIsSocketConnected(true);
          setConnectionStatus('Connected');
          console.log('Doctor - Socket.IO connected - ready to send notifications');
        });

        socket.on('disconnect', (reason) => {
          setIsSocketConnected(false);
          setConnectionStatus(`Disconnected: ${reason}`);
          console.log('Doctor - Socket.IO disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
          setConnectionStatus(`Connection Error: ${error.message}`);
          console.error('Doctor - Socket.IO connection error:', error);
        });

        socket.on('reconnect', (attemptNumber) => {
          setIsSocketConnected(true);
          setConnectionStatus('Reconnected');
          console.log(`Doctor - Reconnected after ${attemptNumber} attempts`);
        });

        // Subscribe to notifications
        subscribeToNotifications(handleNotification);
      }

      // Update connection status periodically
      const statusInterval = setInterval(() => {
        const status = getSocketStatus();
        setIsSocketConnected(status.connected);
        if (status.connected && connectionStatus.includes('Disconnected')) {
          setConnectionStatus('Connected');
          console.log('Doctor - Socket status updated - now connected:', status);
        }
      }, 1000);

      return () => {
        clearInterval(statusInterval);
      };
    } else if (status === 'authenticated') {
      console.log('⚠️ Doctor - Authenticated but missing access token');
      console.log('- Access Token:', session?.accessToken ? 'EXISTS' : 'MISSING');
      setConnectionStatus('Authentication Error: Missing access token');
    } else if (status === 'unauthenticated') {
      console.log('❌ Doctor - User not authenticated');
      setConnectionStatus('Not authenticated');
      socketDisconnect();
      setIsSocketConnected(false);
    } else {
      console.log('⏳ Doctor - Authentication loading...');
      setConnectionStatus('Loading authentication...');
    }

    return () => {
      if (status === 'unauthenticated') {
        console.log('Doctor - User logged out, disconnecting Socket.IO');
        unsubscribeFromNotifications();
        socketDisconnect();
        setIsSocketConnected(false);
        setConnectionStatus('Disconnected');
        setNotifications([]);
      }
    };
  }, [status, session?.accessToken]);

  // Handle incoming notifications
  const handleNotification = (notification: NotificationMessage) => {
    console.log('Doctor - Received notification:', notification);

    // Add timestamp and id for UI purposes
    const notificationWithExtras = {
      ...notification,
      id: notification.requestId || `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Add to notifications list
    setNotifications(prev => [notificationWithExtras, ...prev]);

    // Update accessRequest state if this notification is about the current request
    if (accessRequest && notification.requestId && notification.requestId === accessRequest.id) {
      if (notification.notificationType === 'ACCESS_APPROVED') {
        setAccessRequest({
          ...accessRequest,
          status: 'APPROVED',
          respondedAt: new Date().toISOString()
        });
        toast.success(`✅ Access Approved!`, {
          description: notification.message,
          duration: 5000,
        });
      } else if (notification.notificationType === 'ACCESS_DENIED') {
        setAccessRequest({
          ...accessRequest,
          status: 'DENIED',
          respondedAt: new Date().toISOString()
        });
        toast.error(`❌ Access Denied`, {
          description: notification.message,
          duration: 5000,
        });
      } else {
        // For other notification types
        toast.success(`🔔 Notification from Patient`, {
          description: notification.message,
          duration: 5000,
        });
      }
    } else {
      // Show toast notification for notifications not related to current request
      const toastType = notification.notificationType === 'ACCESS_APPROVED' ? 'success' :
                       notification.notificationType === 'ACCESS_DENIED' ? 'error' : 'info';

      if (toastType === 'success') {
        toast.success(`✅ Access Approved!`, {
          description: notification.message,
          duration: 5000,
        });
      } else if (toastType === 'error') {
        toast.error(`❌ Access Denied`, {
          description: notification.message,
          duration: 5000,
        });
      } else {
        toast.success(`🔔 Notification from Patient`, {
          description: notification.message,
          duration: 5000,
        });
      }
    }

    // Auto-refresh prescription list if we have a patient ID and received approval/denial
    if (patientId && (notification.notificationType === 'ACCESS_APPROVED' || notification.notificationType === 'ACCESS_DENIED')) {
      console.log('Auto-refreshing prescription list due to status change...');
      handleGetPatientPrescriptions();
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const refreshConnectionStatus = () => {
    const status = getSocketStatus();
    setIsSocketConnected(status.connected);
    setConnectionStatus(status.connected ? 'Connected' : 'Disconnected');
    console.log('Doctor - Manual connection status refresh:', status);
  };

  const handleGetPatientPrescriptions = async () => {
    try {
      setLoading(true);
      clearMessages();

      if (!patientId.trim()) {
        setError('Patient ID is required');
        setLoading(false);
        return;
      }

      if (!session?.accessToken) {
        setError('No valid session token found');
        setLoading(false);
        return;
      }

      console.log('Fetching prescriptions for patient ID:', patientId);
      const result = await prescriptionService.getPatientPrescriptionsList(patientId, session.accessToken);
      
      setPatientPrescriptions(result);
      setSuccess(`Successfully retrieved ${result.length} prescription(s) for patient ${patientId}`);
      console.log('Retrieved prescriptions:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError('Failed to get patient prescriptions: ' + errorMessage);
      console.error('Error fetching patient prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPrescriptionAccess = async (patientIdParam?: string, prescriptionIdParam?: string) => {
    try {
      setLoading(true);
      clearMessages();

      // Use provided parameters or form values
      const targetPatientId = patientIdParam || accessForm.patientId;
      const targetPrescriptionId = prescriptionIdParam || accessForm.prescriptionId;

      if (!targetPatientId.trim() || !targetPrescriptionId.trim()) {
        setError('Both Patient ID and Prescription ID are required');
        setLoading(false);
        return;
      }

      if (!session?.accessToken) {
        setError('No valid session token found');
        setLoading(false);
        return;
      }

      console.log('Requesting access for:', { patientId: targetPatientId, prescriptionId: targetPrescriptionId, reason: accessForm.requestReason });
      const result = await prescriptionService.createPrescriptionAccess(
        targetPatientId,
        targetPrescriptionId,
        session.accessToken,
        accessForm.requestReason
      );
      
      setAccessRequest(result);
      setSuccess(`Prescription access request sent successfully for prescription ID: ${targetPrescriptionId}`);
      console.log('Access request result:', result);

      // If using parameters (from button), update the form as well
      if (patientIdParam && prescriptionIdParam) {
        setAccessForm({
          ...accessForm,
          patientId: patientIdParam,
          prescriptionId: prescriptionIdParam
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError('Failed to request prescription access: ' + errorMessage);
      console.error('Error requesting prescription access:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearPatientPrescriptions = () => {
    setPatientPrescriptions([]);
    setPatientId('');
  };

  const clearAccessRequest = () => {
    setAccessRequest(null);
    setAccessForm({
      patientId: '',
      prescriptionId: '',
      requestReason: 'Medical consultation and treatment planning'
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Prescription Test Page</h1>
        <p className="text-gray-600 text-lg">Test doctor-specific prescription functions</p>
        <div className="flex justify-center gap-4 mt-4">
          <Badge variant="outline">
            Logged in as: {session.user?.email || 'Unknown'}
          </Badge>
          <Badge variant={isSocketConnected ? "default" : "destructive"}>
            Socket: {connectionStatus}
          </Badge>
        </div>
      </div>

      {/* Socket Connection Status */}
      <Card className={`${isSocketConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={`${isSocketConnected ? 'text-green-800' : 'text-red-800'}`}>
              Socket.IO Connection Status (Doctor)
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
            <div className={`w-3 h-3 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`${isSocketConnected ? 'text-green-700' : 'text-red-700'}`}>
              {connectionStatus}
            </span>
          </div>
          {isSocketConnected && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Ready to send and receive notifications (requests to patients, approvals from patients)
            </p>
          )}
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>WebSocket URL:</strong> http://localhost:9092</p>
            <p><strong>User ID:</strong> {session.user?.id}</p>
            <p><strong>Role:</strong> DOCTOR</p>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-1 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Function 1: Get Patient Prescriptions List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-xl text-blue-800">1. Get Patient Prescriptions List</CardTitle>
          <p className="text-sm text-blue-600 mt-2">
            Retrieve all prescriptions for a specific patient (Doctor Authority Required)
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="patientId" className="text-sm font-medium">
                Patient ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID (e.g., user123, patient456)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This should be the patient's user ID from your system
              </p>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <Button
                onClick={handleGetPatientPrescriptions}
                disabled={loading || !patientId.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Fetching...' : 'Get Prescriptions'}
              </Button>
              {patientPrescriptions.length > 0 && (
                <Button
                  onClick={clearPatientPrescriptions}
                  variant="outline"
                  size="sm"
                >
                  Clear Results
                </Button>
              )}
            </div>
          </div>

          {/* Display Patient Prescriptions Results */}
          {patientPrescriptions.length > 0 && (
            <div className="mt-6">
              <Separator />
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient Prescriptions ({patientPrescriptions.length})
                </h3>
                <div className="grid gap-4">
                  {patientPrescriptions.map((prescription, index) => (
                    <Card key={index} className="bg-gray-50 border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label className="text-xs font-medium text-gray-500">USER ID</Label>
                            <p className="text-sm font-mono">{prescription.userId}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">PROFILE ID</Label>
                            <p className="text-sm font-mono">{prescription.userProfileId}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">PRESCRIPTION NAME</Label>
                            <p className="text-sm font-semibold">{prescription.prescriptionName}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">DOCTOR ID</Label>
                            <p className="text-sm font-mono">{prescription.doctorId}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                            <Badge 
                              variant={prescription.status === 'APPROVED' ? 'default' : 
                                      prescription.status === 'PENDING' ? 'secondary' : 'destructive'}
                            >
                              {prescription.status}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">CREATED</Label>
                            <p className="text-sm">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Prescription ID:</span> {prescription.userProfileId}
                          </div>
                          <Button
                            onClick={() => handleRequestPrescriptionAccess(prescription.userId, prescription.userProfileId)}
                            disabled={loading}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {loading ? 'Requesting...' : 'Request Access'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Function 2: Create Prescription Access Request */}
      <Card className="shadow-lg">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-xl text-green-800">2. Request Prescription Access</CardTitle>
          <p className="text-sm text-green-600 mt-2">
            Request access to a specific patient's prescription (Doctor Authority Required)
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accessPatientId" className="text-sm font-medium">
                Patient ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accessPatientId"
                value={accessForm.patientId}
                onChange={(e) => setAccessForm({...accessForm, patientId: e.target.value})}
                placeholder="Enter patient ID"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="accessPrescriptionId" className="text-sm font-medium">
                Prescription ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accessPrescriptionId"
                value={accessForm.prescriptionId}
                onChange={(e) => setAccessForm({...accessForm, prescriptionId: e.target.value})}
                placeholder="Enter prescription ID"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="requestReason" className="text-sm font-medium">
              Request Reason
            </Label>
            <Textarea
              id="requestReason"
              value={accessForm.requestReason}
              onChange={(e) => setAccessForm({...accessForm, requestReason: e.target.value})}
              placeholder="Enter reason for requesting access to this prescription"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={() => handleRequestPrescriptionAccess()}
              disabled={loading || !accessForm.patientId.trim() || !accessForm.prescriptionId.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Requesting Access...' : 'Request Access'}
            </Button>
            
            {accessRequest && (
              <Button
                onClick={clearAccessRequest}
                variant="outline"
                size="sm"
              >
                Clear Request
              </Button>
            )}
          </div>

          {/* Display Access Request Result */}
          {accessRequest && (
            <div className="mt-6">
              <Separator />
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Access Request Details
                </h3>
                <Card className="bg-green-50 border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-500">PRESCRIPTION ID</Label>
                        <p className="text-sm font-mono">{accessRequest.prescriptionId}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">PATIENT USER ID</Label>
                        <p className="text-sm font-mono">{accessRequest.patientUserId}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">DOCTOR USER ID</Label>
                        <p className="text-sm font-mono">{accessRequest.doctorUserId}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">STATUS</Label>
                        <Badge 
                          variant={accessRequest.status === 'APPROVED' ? 'default' : 
                                  accessRequest.status === 'PENDING' ? 'secondary' : 'destructive'}
                        >
                          {accessRequest.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">REQUEST REASON</Label>
                        <p className="text-sm">{accessRequest.requestReason}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">REQUESTED AT</Label>
                        <p className="text-sm">{new Date(accessRequest.requestedAt).toLocaleString()}</p>
                      </div>
                      {accessRequest.respondedAt && (
                        <div>
                          <Label className="text-xs font-medium text-gray-500">RESPONDED AT</Label>
                          <p className="text-sm">{new Date(accessRequest.respondedAt).toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-xs font-medium text-gray-500">EXPIRES AT</Label>
                        <p className="text-sm">{new Date(accessRequest.expiresAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Received Notifications Section */}
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
            Real-time notifications from patients (e.g., access approvals)
          </p>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No notifications received yet</p>
              <p className="text-sm">
                Waiting for patient responses to your access requests...
              </p>
              <p className="text-xs mt-4 text-gray-400">
                When patients approve your prescription access requests, you'll see notifications here
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={`${notification.requestId || Date.now()}-${index}`}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="default">
                      {notification.notificationType}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {(notification as any).timestamp ? new Date((notification as any).timestamp).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-800 font-medium">
                      {notification.message}
                    </p>

                    {notification.prescriptionName && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900">
                          Prescription: {notification.prescriptionName}
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
                      From Patient: {notification.recipientId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold">Function 1: Get Patient Prescriptions List</h4>
            <p className="text-gray-600">
              • Enter a valid patient ID to retrieve all their prescriptions
              • This function requires doctor-level authorization
              • Returns prescription summary data including status, doctor ID, and timestamps
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Function 2: Request Prescription Access</h4>
            <p className="text-gray-600">
              • Enter both patient ID and specific prescription ID
              • Sends a formal access request to view detailed prescription data
              • Include a reason for the access request
              • Returns access request details with status and expiration
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Function 3: Receive Patient Notifications</h4>
            <p className="text-gray-600">
              • Real-time notifications appear when patients approve your access requests
              • Notifications include approval confirmations and prescription details
              • Toast messages will appear for each new notification
              • All notifications are logged and displayed in the "Received Notifications" section
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600">Important Notes:</h4>
            <ul className="text-gray-600 list-disc list-inside space-y-1">
              <li>Both functions require valid authentication tokens</li>
              <li>Doctor role permissions are required for these operations</li>
              <li>Socket.IO must be connected to receive real-time notifications</li>
              <li>Check browser console for detailed API responses and errors</li>
              <li>Use realistic patient IDs and prescription IDs for testing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
