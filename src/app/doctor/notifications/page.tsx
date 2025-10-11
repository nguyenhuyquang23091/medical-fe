"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, MoreHorizontal, X, Clock, User, FileText, CheckCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotificationMessage, NotificationType } from "@/types/notification"
import { useNotifications } from "@/app/context/NotificationContext"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const getNotificationIcon = (type: string) => {
  const typeUpper = type?.toUpperCase() || ''

  if (typeUpper.includes('REQUEST') || typeUpper.includes('PENDING')) {
    return <FileText className="h-4 w-4 text-blue-600" />
  } else if (typeUpper.includes('APPROVED') || typeUpper.includes('ACCEPTED') || typeUpper.includes('SUCCESS')) {
    return <CheckCircle className="h-4 w-4 text-green-600" />
  } else if (typeUpper.includes('DENIED') || typeUpper.includes('REJECTED') || typeUpper.includes('FAILED')) {
    return <X className="h-4 w-4 text-red-600" />
  } else if (typeUpper.includes('UPDATED') || typeUpper.includes('MODIFIED')) {
    return <AlertCircle className="h-4 w-4 text-orange-600" />
  } else if (typeUpper.includes('CREATED') || typeUpper.includes('NEW')) {
    return <FileText className="h-4 w-4 text-purple-600" />
  } else {
    return <Bell className="h-4 w-4 text-gray-600" />
  }
}

const getNotificationBadgeColor = (type: string) => {
  const typeUpper = type?.toUpperCase() || ''

  if (typeUpper.includes('REQUEST') || typeUpper.includes('PENDING')) {
    return "bg-blue-100 text-blue-800 border-blue-200"
  } else if (typeUpper.includes('APPROVED') || typeUpper.includes('ACCEPTED') || typeUpper.includes('SUCCESS')) {
    return "bg-green-100 text-green-800 border-green-200"
  } else if (typeUpper.includes('DENIED') || typeUpper.includes('REJECTED') || typeUpper.includes('FAILED')) {
    return "bg-red-100 text-red-800 border-red-200"
  } else if (typeUpper.includes('UPDATED') || typeUpper.includes('MODIFIED')) {
    return "bg-orange-100 text-orange-800 border-orange-200"
  } else if (typeUpper.includes('CREATED') || typeUpper.includes('NEW')) {
    return "bg-purple-100 text-purple-800 border-purple-200"
  } else {
    return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

interface NotificationItemProps {
  notification: NotificationMessage
  onMarkAsRead: (id: string) => void
  onMarkAsUnread: (id: string) => void
  onDelete: (id: string) => void
  onClick?: (notification: NotificationMessage) => void
}

const NotificationItem = ({ notification, onMarkAsRead, onMarkAsUnread, onDelete, onClick }: NotificationItemProps) => {
  const [isHovered, setIsHovered] = useState(false)

  // Safe date parsing
  const getTimeAgo = () => {
    if (!notification.createdAt) return 'Just now'

    try {
      const date = new Date(notification.createdAt)
      if (isNaN(date.getTime())) {
        return 'Just now'
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Error parsing date:', notification.createdAt, error)
      return 'Just now'
    }
  }

  return (
    <div
      className={cn(
        "group relative p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50",
        !notification.isRead && "bg-blue-50/30 border-l-4 border-l-blue-500"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(notification)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">
            <Bell className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Title */}
              {notification.title && (
                <h4 className={cn(
                  "text-sm font-semibold mb-1",
                  !notification.isRead ? "text-gray-900" : "text-gray-700"
                )}>
                  {notification.title}
                </h4>
              )}

              {/* Message */}
              <p className={cn(
                "text-sm leading-relaxed",
                !notification.isRead ? "font-medium text-gray-900" : "text-gray-700"
              )}>
                {notification.message || 'No message content'}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {getNotificationIcon(notification.notificationType || '')}
                  <span className="text-xs text-gray-500">
                    {getTimeAgo()}
                  </span>
                </div>

                {notification.notificationType && (
                  <Badge variant="outline" className={cn("text-xs border", getNotificationBadgeColor(notification.notificationType || ''))}>
                    {(notification.notificationType || '').replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={cn(
              "flex items-center gap-1 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              {!notification.isRead ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(notification.id!)
                  }}
                >
                  <Check className="h-4 w-4 text-blue-600" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsUnread(notification.id!)
                  }}
                >
                  <div className="h-2 w-2 bg-blue-600 rounded-full" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      notification.isRead ? onMarkAsUnread(notification.id!) : onMarkAsRead(notification.id!)
                    }}
                  >
                    {notification.isRead ? "Mark as unread" : "Mark as read"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(notification.id!)
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    Delete notification
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-2 w-2 bg-blue-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  // Use NotificationContext instead of direct API calls
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    clearNotification,
    setPage
  } = useNotifications()

  const allCount = notifications.length

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.isRead
    return true
  })

  const handleNotificationClick = async (notification: NotificationMessage) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.id!)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
            </p>
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsRead()}
            variant="outline"
            className="hover:bg-blue-50 hover:border-blue-300"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification Content */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                All ({allCount})
              </TabsTrigger>
              <TabsTrigger 
                value="unread"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Unread ({unreadCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading notifications</h3>
                <p className="text-gray-500 max-w-sm">{error}</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div>
                {filteredNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id || `notification-${index}`}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onMarkAsUnread={markAsUnread}
                    onDelete={clearNotification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "unread" ? "No unread notifications" : "No notifications"}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {activeTab === "unread"
                    ? "All your notifications have been read."
                    : "When you receive notifications, they'll appear here."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {totalElements} total notification{totalElements !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
