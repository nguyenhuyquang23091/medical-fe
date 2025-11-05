export interface NotificationMessage {
    id?: string;
    recipientUserId: string;
    notificationType?: string | null;
    title?: string | null;
    message?: string | null;
    isRead?: boolean;
    isProcessed?: boolean;
    createdAt?: string | null;
    readAt?: string | null;
    // Metadata for flexible notification data (matches backend Map<String, Object>)
    metadata?: {
        requestId?: string;
        prescriptionId?: string;
        prescriptionName?: string;
        doctorId?: string;
        doctorName?: string;
        doctorAvatar?: string;
        status?: string;
        [key: string]: any; 
    } | null;
}


export enum NotificationType {
    ACCESS_REQUEST = 'ACCESS_REQUEST', 
    ACCESS_APPROVED = 'ACCESS_APPROVED',
    ACCESS_DENIED = 'ACCESS_DENIED',
    ACCESS_PROCESSED = 'ACCESS_PROCESSED'
}

export interface NotificationState {
    notifications: NotificationMessage[];
    unreadCount: number;
    isConnected: boolean;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
}



export interface NotificationContextType {
    notifications: NotificationMessage[];
    unreadCount: number;
    isConnected: boolean;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
    loadNotifications: (page?: number, size?: number) => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAsUnread: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotification: (notificationId: string) => Promise<void>;
    clearAllNotifications: () => Promise<void>;
    setPage: (page: number) => void;
}
