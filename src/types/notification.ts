export interface NotificationMessage {
    id?: string;
    recipientUserId: string; 
    senderUserId?: string;
    senderName?: string;
    notificationType: NotificationType;
    message: string;
    requestId?: string;
    prescriptionId?: string;
    prescriptionName?: string;
    timestamp: string;
    isRead?: boolean;
    data?: Record<string, any>;
}

export enum NotificationType {
    PRESCRIPTION_ACCESS_REQUEST = 'PRESCRIPTION_ACCESS_REQUEST',
    PRESCRIPTION_ACCESS_APPROVED = 'PRESCRIPTION_ACCESS_APPROVED',
    PRESCRIPTION_ACCESS_DENIED = 'PRESCRIPTION_ACCESS_DENIED',
    PRESCRIPTION_UPDATED = 'PRESCRIPTION_UPDATED',
    PRESCRIPTION_CREATED = 'PRESCRIPTION_CREATED',
    GENERAL_NOTIFICATION = 'GENERAL_NOTIFICATION'
}

