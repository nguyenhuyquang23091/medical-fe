"use client"

import React, { useState, useRef, useEffect } from "react"
import { Bell, X, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { NotificationBadge } from "@/components/doctor/NotificationBadge"
import { useNotifications } from "@/app/context/NotificationContext"
import { NotificationMessage } from "@/types/notification"
import { cn } from "@/lib/utils"
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
  // Return placeholder avatar based on notification type
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
        "flex flex-col gap-3 p-3 hover:bg-gray-100 transition-colors relative group",
        !notification.isRead && "bg-blue-50 hover:bg-blue-100"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-12 h-12">
            <AvatarImage src={notification.metadata?.doctorAvatar || avatarUrl} />
            <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
              {notification.metadata?.doctorName?.charAt(0) || initials}
            </AvatarFallback>
          </Avatar>
          {/* Green online indicator for approved notifications */}
          {notification.notificationType?.toUpperCase().includes("APPROVED") && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm">
            <span className="font-semibold text-gray-900">
              {notification.title || notification.metadata?.doctorName || "Notification"}
            </span>{" "}
            <span className="text-gray-700">
              {notification.message || "You have a new notification"}
            </span>
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            {formatTimestamp(notification.createdAt)}
          </div>
        </div>

        {/* Unread indicator and actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.isRead && (
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
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
        <div className="flex gap-2 ml-[60px]">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              if (notification.id) onAccept(notification.id)
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold h-9 rounded-md"
          >
            Accept
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              if (notification.id) onDecline(notification.id)
            }}
            variant="outline"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold h-9 rounded-md border-0"
          >
            Decline
          </Button>
        </div>
      )}

      {/* Status message if already responded */}
      {hasResponded && notification.metadata?.status && (
        <div className="ml-[60px] text-xs text-gray-600">
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

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    clearNotification,
    loadNotifications,
  } = useNotifications()

  const { session } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      // Check if click is outside the dropdown ref
      if (!dropdownRef.current?.contains(target)) {
        // Also check if the click is on a dropdown menu portal (shadcn/ui renders menus in portals)
        const isDropdownMenuClick = (target as Element).closest('[role="menu"]') !== null

        if (!isDropdownMenuClick) {
          setIsOpen(false)
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

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
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <NotificationBadge count={unreadCount} />
          </div>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  activeTab === "all"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  activeTab === "unread"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Push notification banner (optional) */}
          {unreadCount === 0 && !isLoading && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Your notifications are all caught up
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    You're all set for now
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="text-sm text-gray-600 mt-2">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  {activeTab === "unread" ? "No unread notifications" : "No notifications"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {activeTab === "unread"
                    ? "You're all caught up!"
                    : "When you get notifications, they'll show up here"}
                </p>
              </div>
            ) : (
              <div>
                {activeTab === "all" && filteredNotifications.some((n) => !n.isRead) && (
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">New</h3>
                  </div>
                )}
                {filteredNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id || `notification-${index}`}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = "/dashboard/notifications"
                }}
                className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 hover:bg-gray-100 rounded transition-colors"
              >
                See all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
