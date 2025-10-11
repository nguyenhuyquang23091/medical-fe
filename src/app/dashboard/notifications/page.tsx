"use client"

import React, { useState, useEffect } from "react"
import { Bell, MoreHorizontal, ArrowLeft, Settings } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNotifications } from "@/app/context/NotificationContext"
import { NotificationMessage } from "@/types/notification"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import prescriptionService from "@/actions/profile/prescription"
import { useAuth } from "@/app/context/AuthContext"
import { toast } from "sonner"

type TabType = "all" | "unread"

const formatTimestamp = (timestamp?: string | null): string => {
  if (!timestamp) return "Just now"

  const now = new Date()
  const notificationDate = new Date(timestamp)
  const diffInMs = now.getTime() - notificationDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInHours < 24) return `${diffInHours}h`
  if (diffInDays < 7) return `${diffInDays}d`
  if (diffInWeeks < 4) return `${diffInWeeks}w`
  return notificationDate.toLocaleDateString()
}

const getNotificationAvatar = (type?: string | null): string => {
  const typeUpper = (type || "").toUpperCase()

  if (typeUpper.includes("APPROVED") || typeUpper.includes("ACCEPTED")) {
    return "/avatars/success.png"
  } else if (typeUpper.includes("DENIED") || typeUpper.includes("REJECTED")) {
    return "/avatars/warning.png"
  } else if (typeUpper.includes("REQUEST") || typeUpper.includes("PENDING")) {
    return "/avatars/info.png"
  }

  return "/avatars/default.png"
}

const getNotificationInitials = (type?: string | null): string => {
  const typeUpper = (type || "").toUpperCase()

  if (typeUpper.includes("APPROVED")) return "✓"
  if (typeUpper.includes("DENIED")) return "✗"
  if (typeUpper.includes("REQUEST")) return "?"
  if (typeUpper.includes("UPDATED")) return "↻"

  return "!"
}

interface NotificationItemProps {
  notification: NotificationMessage
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onAccept?: (id: string) => void
  onDecline?: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAccept,
  onDecline,
}) => {
  const initials = getNotificationInitials(notification.notificationType)
  const avatarUrl = getNotificationAvatar(notification.notificationType)

  // Check if this is an actionable notification
  // Show buttons only if: 1) ACCESS_REQUEST type AND 2) isProcessed is false (or null/undefined)
  const isAccessRequest = notification.notificationType === 'ACCESS_REQUEST'
  const isActionable = isAccessRequest && !notification.isProcessed
  const hasResponded = isAccessRequest && notification.isProcessed === true

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 hover:bg-gray-50 transition-colors relative group rounded-lg border border-transparent hover:border-gray-200",
        !notification.isRead && "bg-blue-50 hover:bg-blue-100"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-14 h-14">
            <AvatarImage src={notification.metadata?.doctorAvatar || avatarUrl} />
            <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
              {notification.metadata?.doctorName?.charAt(0) || initials}
            </AvatarFallback>
          </Avatar>
          {notification.notificationType?.toUpperCase().includes("APPROVED") && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-base">
            <span className="font-semibold text-gray-900">
              {notification.title || notification.metadata?.doctorName || "Notification"}
            </span>{" "}
            <span className="text-gray-700">
              {notification.message || "You have a new notification"}
            </span>
          </div>
          <div className="text-sm text-blue-600 font-medium mt-1.5">
            {formatTimestamp(notification.createdAt)}
          </div>
        </div>

        {/* Unread indicator and actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {!notification.isRead && (
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!notification.isRead && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    if (notification.id) onMarkAsRead(notification.id)
                  }}
                >
                  Mark as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  if (notification.id) onDelete(notification.id)
                }}
              >
                Delete notification
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Action Buttons (Accept/Decline) */}
      {isActionable && onAccept && onDecline && (
        <div className="flex gap-3 ml-[72px]">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              if (notification.id) onAccept(notification.id)
            }}
            className="px-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold h-10 rounded-md"
          >
            Accept
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              if (notification.id) onDecline(notification.id)
            }}
            variant="outline"
            className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold h-10 rounded-md border-0"
          >
            Decline
          </Button>
        </div>
      )}

      {/* Status message if already responded */}
      {hasResponded && notification.metadata?.status && (
        <div className="ml-[72px] text-sm text-gray-600">
          {notification.metadata.status === 'APPROVED' && (
            <span className="text-green-600 font-medium">✓ Approved</span>
          )}
          {notification.metadata.status === 'DENIED' && (
            <span className="text-gray-500 font-medium">Denied</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("all")

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    loadNotifications,
  } = useNotifications()

  const { session } = useAuth()

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      toast.error("Failed to mark as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await clearNotification(id)
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const handleAccept = async (id: string) => {
    if (!session?.accessToken) {
      toast.error("Authentication required")
      return
    }

    try {
      // Find the notification to get the requestId from metadata
      const notification = notifications.find(n => n.id === id)
      const requestId = notification?.metadata?.requestId

      if (!requestId) {
        toast.error("Invalid request")
        return
      }

      // Call API to approve doctor request
      await prescriptionService.approveDoctorRequest(requestId, session.accessToken)

      // Mark notification as read
      await markAsRead(id)

      toast.success("Request approved successfully")

      // WebSocket will update the UI automatically via 'notification_update' event
    } catch (error) {
      console.error("Failed to accept invitation:", error)
      toast.error("Failed to approve request")
    }
  }

  const handleDecline = async (id: string) => {
    if (!session?.accessToken) {
      toast.error("Authentication required")
      return
    }

    try {
      // Find the notification to get the requestId from metadata
      const notification = notifications.find(n => n.id === id)
      const requestId = notification?.metadata?.requestId

      if (!requestId) {
        toast.error("Invalid request")
        return
      }

      // Call API to deny doctor request
      await prescriptionService.denyDoctorRequest(requestId, session.accessToken)

      // Mark notification as read
      await markAsRead(id)

      toast.info("Request declined")

      // WebSocket will update the UI automatically via 'notification_update' event
    } catch (error) {
      console.error("Failed to decline invitation:", error)
      toast.error("Failed to decline request")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">{unreadCount} unread</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Mark all as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-semibold transition-all",
                activeTab === "all"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-semibold transition-all",
                activeTab === "unread"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                <p className="text-sm text-gray-600 mt-4">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
                </h3>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  {activeTab === "unread"
                    ? "You're all caught up! Check back later for new updates."
                    : "When you get notifications, they'll show up here."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeTab === "all" && filteredNotifications.some((n) => !n.isRead) && (
                  <div className="px-4 py-3 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-900">New</h3>
                  </div>
                )}
                {filteredNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id || index}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load more button (for future pagination) */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="px-8"
              disabled={isLoading}
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
