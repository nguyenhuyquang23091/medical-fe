"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Pill,
  Activity,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Edit,
  Trash2,
  Save,
  Upload,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { useSession } from "next-auth/react"
import { useUserProfile } from "@/app/context/UserProfileContext"
import prescriptionService from "@/actions/profile/prescription"
import { toast } from "sonner"
import { PatientPrescriptionUpdateRequest } from "@/types/prescription"

// Type definitions matching backend model
interface PrescriptionData {
  medicationName: string
  dosage: string
  frequency: string
  instructions: string
  doctorNotes: string
  bloodSugarLevel?: string
  readingType?: string
  bloodSugarCategory?: string
  measurementDate?: string
}

interface UserPrescription {
  id: string
  userId: string
  userProfileId: string
  prescriptionName: string
  imageURLs: string[]
  prescriptionData: PrescriptionData[]
  doctorId: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function PrescriptionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { status } = useSession()
  const { userProfile } = useUserProfile()

  const [prescription, setPrescription] = useState<UserPrescription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedBloodSugarLevel, setEditedBloodSugarLevel] = useState("")
  const [editedReadingType, setEditedReadingType] = useState("")
  const [editedBloodSugarCategory, setEditedBloodSugarCategory] = useState("")
  const [newImages, setNewImages] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])

  // Fetch prescription from API
  useEffect(() => {
    const fetchPrescription = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get session token
        const session = await fetch('/api/auth/session').then(res => res.json())
        if (!session?.accessToken) {
          setError("Authentication required")
          toast.error("Please log in to view prescription details")
          return
        }

        console.log('Fetching prescription details for ID:', id)

        // Call getMyDetailPrescription API with prescription ID
        const response = await prescriptionService.getMyDetailPrescription(id, session.accessToken)

        console.log('Prescription detail response:', response)
        console.log('Image URLs from API:', response.imageUrls)
        console.log('Prescription Data from API:', response.prescriptionData)

        // Validate response
        if (!response) {
          throw new Error('No data returned from API')
        }

        // Extract image URLs - exact field name from backend: imageURLS
        const imageUrls = (response as any).imageURLS ||
                         response.imageUrls ||
                         (response as any).imageURLs ||
                         []

        console.log('Extracted imageUrls:', imageUrls)

        // Map PrescriptionResponse to UserPrescription with proper field mapping
        const mappedData: UserPrescription = {
          id: response.id || id,
          userId: response.userId || '',
          userProfileId: response.userProfileId || '',
          prescriptionName: response.prescriptionName || 'Unnamed Prescription',
          doctorId: response.doctorId || 'Unknown Doctor',
          status: response.status || 'PENDING',
          imageURLs: imageUrls,
          prescriptionData: response.prescriptionData || [],
          createdAt: response.createdAt || new Date().toISOString(),
          updatedAt: response.updatedAt || new Date().toISOString(),
        }

        console.log('Mapped prescription data:', mappedData)
        console.log('Mapped imageURLs:', mappedData.imageURLs)
        console.log('Number of images:', mappedData.imageURLs.length)
        setPrescription(mappedData)
      } catch (err) {
        console.error("Error fetching prescription details:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load prescription details"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated" && id) {
      fetchPrescription()
    }
  }, [id, status])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700 border-green-200"
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleNextImage = () => {
    if (prescription && prescription.imageURLs.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % prescription.imageURLs.length)
    }
  }

  const handlePrevImage = () => {
    if (prescription && prescription.imageURLs.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? prescription.imageURLs.length - 1 : prev - 1
      )
    }
  }

  const handleOpenEditModal = () => {
    if (prescription) {
      setEditedName(prescription.prescriptionName)
      // Initialize with first blood sugar record if available
      const firstData = prescription.prescriptionData[0]
      if (firstData) {
        setEditedBloodSugarLevel(firstData.bloodSugarLevel || "")
        setEditedReadingType(firstData.readingType || "")
        setEditedBloodSugarCategory(firstData.bloodSugarCategory || "")
      }
      setIsEditModalOpen(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setNewImages(fileArray)

      // Create preview URLs
      const previews = fileArray.map(file => URL.createObjectURL(file))
      setPreviewImages(previews)
    }
  }

  const handleRemoveImage = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(previewImages[index])

    // Remove image and preview at the specified index
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdatePrescription = async () => {
    if (!prescription) return

    try {
      setIsSaving(true)
      const session = await fetch('/api/auth/session').then(res => res.json())

      if (!session?.accessToken) {
        toast.error("Authentication required")
        return
      }

      const updateRequest: PatientPrescriptionUpdateRequest = {
        prescriptionName: editedName || prescription.prescriptionName,
      }

      // Add prescription data if blood sugar fields are filled
      if (editedBloodSugarLevel && editedReadingType) {
        updateRequest.prescriptionData = [{
          bloodSugarLevel: editedBloodSugarLevel,
          readingType: editedReadingType,
          measurementDate: new Date().toISOString(),
          bloodSugarCategory: editedBloodSugarCategory || undefined,
        }]
      }

      const updated = await prescriptionService.updateMyPrescription(
        prescription.id,
        updateRequest,
        session.accessToken,
        newImages.length > 0 ? newImages : undefined
      )

      toast.success("Prescription updated successfully")
      setIsEditModalOpen(false)

      // Refresh prescription data
      const refreshed = await prescriptionService.getMyDetailPrescription(id, session.accessToken)
      const imageUrls = (refreshed as any).imageURLS || refreshed.imageUrls || []
      setPrescription({
        id: refreshed.id || id,
        userId: refreshed.userId || '',
        userProfileId: refreshed.userProfileId || '',
        prescriptionName: refreshed.prescriptionName || 'Unnamed Prescription',
        doctorId: refreshed.doctorId || 'Unknown Doctor',
        status: refreshed.status || 'PENDING',
        imageURLs: imageUrls,
        prescriptionData: refreshed.prescriptionData || [],
        createdAt: refreshed.createdAt || new Date().toISOString(),
        updatedAt: refreshed.updatedAt || new Date().toISOString(),
      })

      // Clean up
      setNewImages([])
      setPreviewImages([])
    } catch (error) {
      console.error("Error updating prescription:", error)
      toast.error("Failed to update prescription")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePrescription = async () => {
    if (!prescription) return

    try {
      setIsDeleting(true)
      const session = await fetch('/api/auth/session').then(res => res.json())

      if (!session?.accessToken) {
        toast.error("Authentication required")
        return
      }

      await prescriptionService.deleteMyPrescription(prescription.id, session.accessToken)

      toast.success("Prescription deleted successfully")
      setIsDeleteDialogOpen(false)

      // Navigate back to prescriptions list
      router.push('/dashboard/prescriptions')
    } catch (error) {
      console.error("Error deleting prescription:", error)
      toast.error("Failed to delete prescription")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle authentication states
  if (status === "loading" || isLoading) {
    return <LoadingState />
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-orange-600 mb-2">Authentication Required</h2>
            <p className="mb-4">Please log in to view prescription details.</p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !prescription) {
    return <ErrorState error={error || "Prescription not found"} onBack={() => router.back()} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{prescription.prescriptionName}</h1>
                <p className="text-sm text-gray-500">Prescription Details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEditModal}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Prescription Overview</CardTitle>
                  <Badge className={`${getStatusColor(prescription.status)} border`}>
                    {prescription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Prescribed by</p>
                      <p className="font-medium text-gray-900">{prescription.doctorId}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Prescription ID</p>
                      <p className="font-medium text-gray-900 font-mono text-sm">{prescription.id}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(prescription.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500">{formatTime(prescription.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(prescription.updatedAt)}
                      </p>
                      <p className="text-xs text-gray-500">{formatTime(prescription.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medications/Prescription Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Pill className="w-5 h-5 mr-2 text-blue-500" />
                  Medications & Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prescription.prescriptionData.map((data, index) => (
                  <MedicationCard key={index} data={data} index={index} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Gallery */}
            {prescription.imageURLs.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prescription Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden">
                      <div
                        className="relative cursor-pointer group"
                        onClick={() => setIsImageModalOpen(true)}
                      >
                        <img
                          src={prescription.imageURLs[selectedImageIndex]}
                          alt={`Prescription ${selectedImageIndex + 1}`}
                          className="w-full h-auto rounded-lg"
                          style={{
                            display: 'block',
                            maxHeight: '500px',
                            objectFit: 'contain',
                            margin: '0 auto'
                          }}
                          onError={(e) => {
                            console.error('Image failed to load:', prescription.imageURLs[selectedImageIndex])
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', prescription.imageURLs[selectedImageIndex])
                          }}
                        />
                        <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-all flex items-center justify-center pointer-events-none">
                          <p className="text-gray-800 bg-white/90 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Click to enlarge
                          </p>
                        </div>
                      </div>

                      {prescription.imageURLs.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 shadow-md z-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePrevImage()
                            }}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 shadow-md z-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNextImage()
                            }}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {prescription.imageURLs.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {prescription.imageURLs.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index
                                ? "border-blue-500 shadow-md"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Thumbnail failed to load:', url)
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-gray-500 text-center">
                      {prescription.imageURLs.length} image{prescription.imageURLs.length !== 1 ? "s" : ""}{" "}
                      attached
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <FileText className="w-12 h-12 mb-2" />
                    <p className="text-sm">No images attached</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Medications</span>
                  <span className="font-semibold">{prescription.prescriptionData.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Images Attached</span>
                  <span className="font-semibold">{prescription.imageURLs.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge className={`${getStatusColor(prescription.status)} border text-xs`}>
                    {prescription.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && prescription.imageURLs.length > 0 && (
        <ImageModal
          imageUrl={prescription.imageURLs[selectedImageIndex]}
          onClose={() => setIsImageModalOpen(false)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          currentIndex={selectedImageIndex}
          totalImages={prescription.imageURLs.length}
        />
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Prescription</DialogTitle>
            <DialogDescription>
              Update prescription details and blood sugar readings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Prescription Name */}
            <div className="space-y-2">
              <Label htmlFor="prescriptionName">Prescription Name</Label>
              <Input
                id="prescriptionName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter prescription name"
              />
            </div>

            <Separator />

            {/* Blood Sugar Fields */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-900">Blood Sugar Reading (Optional)</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodSugarLevel">Blood Sugar Level (mg/dL)</Label>
                  <Input
                    id="bloodSugarLevel"
                    type="number"
                    value={editedBloodSugarLevel}
                    onChange={(e) => setEditedBloodSugarLevel(e.target.value)}
                    placeholder="e.g., 120"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readingType">Reading Type</Label>
                  <select
                    id="readingType"
                    value={editedReadingType}
                    onChange={(e) => setEditedReadingType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select type</option>
                    <option value="FASTING">Fasting</option>
                    <option value="BEFORE_MEAL">Before Meal</option>
                    <option value="AFTER_MEAL">After Meal</option>
                    <option value="BEDTIME">Bedtime</option>
                    <option value="RANDOM">Random</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodSugarCategory">Category</Label>
                  <select
                    id="bloodSugarCategory"
                    value={editedBloodSugarCategory}
                    onChange={(e) => setEditedBloodSugarCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select category</option>
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="VERY_HIGH">Very High</option>
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="images">Upload New Images (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('images')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {previewImages.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {previewImages.length} image{previewImages.length !== 1 ? 's' : ''} selected. Hover to remove.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setNewImages([])
                setPreviewImages([])
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdatePrescription}
              disabled={isSaving || !editedName.trim()}
            >
              {isSaving ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prescription
              "{prescription?.prescriptionName}" and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrescription}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Prescription
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Medication Card Component
function MedicationCard({ data, index }: { data: PrescriptionData; index: number }) {
  // Check if this is a blood sugar record (patient prescription) or medication (doctor prescription)
  const isBloodSugarRecord = !!data.bloodSugarLevel && !data.medicationName

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isBloodSugarRecord ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            <span className={`font-semibold text-sm ${
              isBloodSugarRecord ? 'text-purple-600' : 'text-blue-600'
            }`}>{index + 1}</span>
          </div>
          <h3 className="font-semibold text-lg text-gray-900">
            {data.medicationName || `Blood Sugar Reading #${index + 1}`}
          </h3>
        </div>
        {data.dosage && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {data.dosage}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {/* Medication Fields */}
        {data.medicationName && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.frequency && <InfoItem label="Frequency" value={data.frequency} />}
              {data.measurementDate && (
                <InfoItem label="Measurement Date" value={data.measurementDate} />
              )}
            </div>

            {data.instructions && (
              <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                <p className="text-sm font-medium text-blue-900 mb-1">Instructions</p>
                <p className="text-sm text-blue-700">{data.instructions}</p>
              </div>
            )}

            {data.doctorNotes && (
              <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                <p className="text-sm font-medium text-amber-900 mb-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Doctor's Notes
                </p>
                <p className="text-sm text-amber-700">{data.doctorNotes}</p>
              </div>
            )}
          </>
        )}

        {/* Blood Sugar Data */}
        {data.bloodSugarLevel && (
          <div className="pt-3 mt-3 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <Activity className="w-4 h-4 text-purple-600 mr-2" />
              <p className="text-sm font-semibold text-gray-900">Blood Sugar Monitoring</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Blood Sugar Level Widget */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium opacity-90">Blood Sugar</p>
                  <Activity className="w-4 h-4 opacity-75" />
                </div>
                <p className="text-2xl font-bold">{data.bloodSugarLevel}</p>
                <p className="text-xs opacity-75 mt-1">mg/dL</p>
              </div>

              {/* Reading Type Widget */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium opacity-90">Reading Type</p>
                  <Clock className="w-4 h-4 opacity-75" />
                </div>
                <p className="text-lg font-bold">{data.readingType}</p>
                {data.measurementDate && (
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(data.measurementDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Category Widget */}
              <div
                className={`rounded-lg p-4 text-white shadow-md ${
                  data.bloodSugarCategory === "High"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : data.bloodSugarCategory === "Low"
                    ? "bg-gradient-to-br from-amber-500 to-amber-600"
                    : "bg-gradient-to-br from-green-500 to-green-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium opacity-90">Category</p>
                  <AlertCircle className="w-4 h-4 opacity-75" />
                </div>
                <p className="text-lg font-bold">{data.bloodSugarCategory}</p>
                <p className="text-xs opacity-75 mt-1">
                  {data.bloodSugarCategory === "High"
                    ? "Above normal range"
                    : data.bloodSugarCategory === "Low"
                    ? "Below normal range"
                    : "Within normal range"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Info Item Component
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

// Image Modal Component
function ImageModal({
  imageUrl,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalImages,
}: {
  imageUrl: string
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  currentIndex: number
  totalImages: number
}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="relative max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Prescription"
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            console.error('Modal image failed to load:', imageUrl)
          }}
          onLoad={() => {
            console.log('Modal image loaded successfully:', imageUrl)
          }}
        />

        {totalImages > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={onPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={onNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {totalImages}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Error State Component
function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={onBack} className="w-full">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
