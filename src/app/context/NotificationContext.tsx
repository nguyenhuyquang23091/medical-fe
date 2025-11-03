"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react'
import { NotificationMessage, NotificationState, NotificationContextType, NotificationType, PageResponse } from '@/types/notification'
import { useAuth } from './AuthContext'
import notificationService from '@/actions/notification/notification'
import {
  initSocketIo,
  socketDisconnect,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  subscribeToNotificationUpdates,
  unsubscribeFromNotificationUpdates
} from '@/lib/socket-IOClient'
import { toast } from 'sonner'

// Notification reducer actions
type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationMessage[] }
  | { type: 'SET_PAGE_RESPONSE'; payload: PageResponse<NotificationMessage> }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationMessage }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<NotificationMessage> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_AS_UNREAD'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number }

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length
      }

    case 'SET_PAGE_RESPONSE':
      return {
        ...state,
        notifications: action.payload.data,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        totalElements: action.payload.totalElements,
        pageSize: action.payload.pageSize,
        unreadCount: action.payload.data.filter(n => !n.isRead).length,
        isLoading: false,
        error: null
      }

    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications]
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length
      }
    
    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload.id
          ? {
              ...notification,
              ...action.payload.updates,
              // Merge metadata properly to preserve existing fields
              metadata: {
                ...notification.metadata,
                ...action.payload.updates.metadata
              }
            }
          : notification
      )
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length
      }
    
    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload)
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.isRead).length
      }
    
    case 'MARK_AS_READ':
      const readNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, isRead: true }
          : notification
      )
      return {
        ...state,
        notifications: readNotifications,
        unreadCount: readNotifications.filter(n => !n.isRead).length
      }
    
    case 'MARK_AS_UNREAD':
      const unreadNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, isRead: false }
          : notification
      )
      return {
        ...state,
        notifications: unreadNotifications,
        unreadCount: unreadNotifications.filter(n => !n.isRead).length
      }
    
    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true
      }))
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      }
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      }
    
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload
      }

    default:
      return state
  }
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  currentPage: 1,
  totalPages: 0,
  totalElements: 0,
  pageSize: 10,
  isLoading: false,
  error: null
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { session } = useAuth()

  // Load notifications with pagination
  const loadNotifications = useCallback(async (page?: number, size?: number) => {
    if (!session?.accessToken) return

    const pageToLoad = page || state.currentPage
    const sizeToLoad = size || state.pageSize

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const pageResponse = await notificationService.getMyNotifications(
        session.accessToken,
        pageToLoad,
        sizeToLoad
      )

      dispatch({ type: 'SET_PAGE_RESPONSE', payload: pageResponse })
    } catch (error) {
      console.error('Failed to load notifications:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load notifications' })
      toast.error('Failed to load notifications')
    }
  }, [session?.accessToken, state.currentPage, state.pageSize])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!session?.accessToken) return

    try {
      await notificationService.markAsRead(session.accessToken, notificationId)
      dispatch({ type: 'MARK_AS_READ', payload: notificationId })
      toast.success('Marked as read')
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to update notification')
    }
  }, [session?.accessToken])

  // Mark notification as unread
  const markAsUnread = useCallback(async (notificationId: string) => {
    if (!session?.accessToken) return

    try {
      // TODO: Replace with real API call when backend is ready
      // await notificationService.markAsUnread(notificationId, session.accessToken)
      dispatch({ type: 'MARK_AS_UNREAD', payload: notificationId })
      console.log('Marked notification as unread:', notificationId)
    } catch (error) {
      console.error('Failed to mark notification as unread:', error)
      toast.error('Failed to update notification')
    }
  }, [session?.accessToken])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.accessToken) return

    try {
      // Mark all current notifications as read via API
      const unreadNotifications = state.notifications.filter(n => !n.isRead)
      await Promise.all(
        unreadNotifications.map(n =>
          notificationService.markAsRead(session.accessToken!, n.id!)
        )
      )
      dispatch({ type: 'MARK_ALL_AS_READ' })
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      toast.error('Failed to update notifications')
    }
  }, [session?.accessToken, state.notifications])

  // Set current page
  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page })
  }, [])

  // Clear single notification
  const clearNotification = useCallback(async (notificationId: string) => {
    if (!session?.accessToken) return

    try {
      await notificationService.deleteNotification(session.accessToken, notificationId)
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId })
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }, [session?.accessToken])

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!session?.accessToken) return

    try {
      // TODO: Replace with real API call when backend is ready
      // await notificationService.clearAllNotifications(session.accessToken)
      dispatch({ type: 'CLEAR_ALL' })
      toast.success('All notifications cleared')
      console.log('Cleared all notifications')
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
      toast.error('Failed to clear notifications')
    }
  }, [session?.accessToken])

  // Handle real-time notifications
  const handleNewNotification = useCallback((notification: NotificationMessage) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })

    const getNotificationTitle = (type?: string | null) => {
      const typeUpper = (type || '')?.toUpperCase() || ''

      if (typeUpper.includes('DENIED') || typeUpper.includes('REJECTED') || typeUpper.includes('FAILED')) {
        return notification.title || 'Access Denied'
      } else if (typeUpper.includes('APPROVED') || typeUpper.includes('ACCEPTED') || typeUpper.includes('SUCCESS')) {
        return notification.title || 'Approved'
      } else if (typeUpper.includes('REQUEST') || typeUpper.includes('PENDING')) {
        return notification.title || 'New Request'
      } else if (typeUpper.includes('UPDATED') || typeUpper.includes('MODIFIED')) {
        return notification.title || 'Updated'
      } else if (typeUpper.includes('CREATED') || typeUpper.includes('NEW')) {
        return notification.title || 'New Item'
      } else {
        return notification.title || 'New Notification'
      }
    }

    const typeUpper = (notification.notificationType || '').toUpperCase()
    const title = getNotificationTitle(notification.notificationType)

    if (typeUpper.includes('DENIED') || typeUpper.includes('REJECTED') || typeUpper.includes('FAILED')) {
      toast.error(title, {
        description: notification.message || 'No details available',
        duration: 5000,
      })
    } else if (typeUpper.includes('APPROVED') || typeUpper.includes('ACCEPTED') || typeUpper.includes('SUCCESS')) {
      toast.success(title, {
        description: notification.message || 'No details available',
        duration: 5000,
      })
    } else {
      toast.info(title, {
        description: notification.message || 'No details available',
        duration: 5000,
      })
    }
  }, [])

  // Handle notification updates (for status changes like REQUEST_STATUS_CHANGED)
  // Fixed: Removed state.notifications dependency to avoid stale closure
  const handleNotificationUpdate = useCallback((event: any) => {
    // Check if this is a REQUEST_STATUS_CHANGED event
    if (event.notificationType === 'REQUEST_STATUS_CHANGED' && event.notificationId) {
      // Update the notification directly using dispatch
      // The reducer will handle finding and updating the notification
      const updates: Partial<NotificationMessage> = {
        isProcessed: true,
        metadata: {
          status: event.status || event.metadata?.status // Get status from event
        }
      }

      dispatch({
        type: 'UPDATE_NOTIFICATION',
        payload: {
          id: event.notificationId,
          updates
        }
      })

      // Show toast notification
      if (event.status === 'APPROVED' || event.metadata?.status === 'APPROVED') {
        toast.success('Request approved', {
          description: 'The access request has been approved',
          duration: 3000,
        })
      } else if (event.status === 'DENIED' || event.metadata?.status === 'DENIED') {
        toast.info('Request denied', {
          description: 'The access request has been denied',
          duration: 3000,
        })
      }
    }
  }, [])

  // Setup WebSocket connection
  useEffect(() => {
    if (session?.accessToken) {
      const socket = initSocketIo(session.accessToken)

      socket.on('connect', () => {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })
      })

      socket.on('disconnect', () => {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
      })

      socket.on('error', (error) => {
        console.error('Socket.IO error:', error)
      })

      subscribeToNotifications(handleNewNotification)
      subscribeToNotificationUpdates(handleNotificationUpdate)

      return () => {
        unsubscribeFromNotifications()
        unsubscribeFromNotificationUpdates()
        socketDisconnect()
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
      }
    }
  }, [session?.accessToken, handleNewNotification, handleNotificationUpdate])

  // Load notifications when page changes
  useEffect(() => {
    if (session?.accessToken) {
      loadNotifications(state.currentPage, state.pageSize)
    }
  }, [session?.accessToken, state.currentPage])

  const value: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isConnected: state.isConnected,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalElements: state.totalElements,
    pageSize: state.pageSize,
    isLoading: state.isLoading,
    error: state.error,
    loadNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    setPage
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
