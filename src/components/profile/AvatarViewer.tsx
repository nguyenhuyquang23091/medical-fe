"use client"

import { useState, useEffect } from "react"
import { X, MoreHorizontal, Trash2, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface AvatarViewerProps {
  isOpen: boolean
  onClose: () => void
  avatarUrl: string | null
  userName: string
  userInitials: string
  onDelete: () => Promise<void>
}

export function AvatarViewer({
  isOpen,
  onClose,
  avatarUrl,
  userName,
  userInitials,
  onDelete
}: AvatarViewerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showDeleteDialog) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, showDeleteDialog, onClose])

  if (!isOpen) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete()
      setShowDeleteDialog(false)
      setDropdownOpen(false)

      // Show success toast while viewer is still open
      toast.success("Profile photo removed successfully")

      // Wait a bit for user to see the success message, then close viewer
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Error deleting avatar:", error)
      toast.error("Failed to remove photo. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent z-10">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white/20">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={userName} />
              <AvatarFallback className="bg-blue-500 text-white text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-sm sm:text-base">{userName}</p>
              <p className="text-white/70 text-xs sm:text-sm">Profile Photo</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Three-dot menu - only show if avatar exists */}
            {avatarUrl && (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white"
                  onClick={(e) => e.stopPropagation()}
                  sideOffset={8}
                >
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteDialog(true)
                      setDropdownOpen(false)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    <span className="font-medium">Remove Photo</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Avatar display - centered */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                draggable={false}
              />
            ) : (
              <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl">
                <span className="text-white text-7xl sm:text-9xl font-bold select-none">{userInitials}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
          <div className="text-center">
            <p className="text-white/70 text-xs sm:text-sm">Press ESC or click anywhere to close</p>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !isDeleting && setShowDeleteDialog(open)}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Delete Photo</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
            Are you sure you want to delete this photo? This action cannot be undone.
              
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteDialog(false)
              }}
              disabled={isDeleting}
              className="mt-0 bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 font-medium cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="mt-0 bg-red-600 hover:bg-red-700 text-white border-0 font-medium cursor-pointer"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
