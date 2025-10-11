"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, FileText, Image as ImageIcon, Search, Filter, Plus, Upload, X, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { useUserProfile } from "@/app/context/UserProfileContext"
import { PrescriptionGeneralData, PatientPrescriptionCreateRequest, PatientPrescriptionDataRequest, PrescriptionResponse } from "@/types/prescription"
import { toast } from "sonner"
import prescriptionService from "@/actions/profile/prescription"

// Types for prescription creation form (extends backend types with File handling)
interface PrescriptionFormData extends Omit<PatientPrescriptionCreateRequest, 'imageURLS'> {
  imageFiles: File[] // Store actual File objects for upload
}

// Reading type options
const READING_TYPES = [
  { value: "FASTING", label: "Fasting" },
  { value: "BEFORE_MEAL", label: "Before Meal" },
  { value: "AFTER_MEAL", label: "After Meal" },
  { value: "BEDTIME", label: "Bedtime" },
  { value: "RANDOM", label: "Random" },
]

// Blood sugar category options
const BLOOD_SUGAR_CATEGORIES = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "VERY_HIGH", label: "Very High" },
]

export default function PrescriptionsPage() {
  const router = useRouter()
  const { status } = useSession()
  const { userProfile } = useUserProfile()
  const [isLoading, setIsLoading] = useState(true)
  const [prescriptions, setPrescriptions] = useState<PrescriptionGeneralData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState<PrescriptionFormData>({
    prescriptionName: "",
    imageFiles: [],
    prescriptionData: [
      {
        bloodSugarLevel: "",
        readingType: "",
        measurementDate: "",
        bloodSugarCategory: "",
      },
    ],
  })

  // Image preview
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Fetch prescriptions list from API (getMyGeneralPrescriptions)
  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoading(true)
      try {
        const session = await fetch('/api/auth/session').then(res => res.json())
        if (session?.accessToken) {
          console.log('Fetching general prescriptions list...')
          const response = await prescriptionService.getMyGeneralPrescriptions(session.accessToken)

          console.log('General prescriptions response:', response)

          // Map PrescriptionResponse to PrescriptionGeneralData
          // Each prescription's ID will be used to fetch details via getMyDetailPrescription
          const generalData: PrescriptionGeneralData[] = response.map((prescription: any) => ({
            id: prescription.id || prescription.userProfileId || '', // Use ID for detail navigation
            userId: prescription.userId || '',
            userProfileId: prescription.userProfileId || '',
            prescriptionName: prescription.prescriptionName || 'Unnamed Prescription',
            doctorId: prescription.doctorId || '',
            status: prescription.status || 'PENDING',
            accessStatus: prescription.accessStatus || null,
            createdAt: prescription.createdAt || new Date().toISOString(),
            updatedAt: prescription.updatedAt || new Date().toISOString(),
          }))

          console.log('Mapped general prescriptions:', generalData)
          setPrescriptions(generalData)
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error)
        toast.error("Failed to load prescriptions")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchPrescriptions()
    }
  }, [status])

  // Filter prescriptions based on search and status
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = prescription.prescriptionName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || prescription.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Form handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newPreviews: string[] = []
    const newFiles: File[] = []

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.match("image.*")) {
        toast.error("Please upload only image files")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB")
        return
      }

      // Create preview URL
      const previewURL = URL.createObjectURL(file)
      newPreviews.push(previewURL)
      newFiles.push(file)
    })

    setImagePreviews((prev) => [...prev, ...newPreviews])
    setFormData((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...newFiles],
    }))
  }

  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index])

    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }))
  }

  const handleAddPrescriptionEntry = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptionData: [
        ...prev.prescriptionData,
        {
          bloodSugarLevel: "",
          readingType: "",
          measurementDate: "",
          bloodSugarCategory: "",
        },
      ],
    }))
  }

  const handleRemovePrescriptionEntry = (index: number) => {
    if (formData.prescriptionData.length === 1) {
      toast.error("At least one prescription entry is required")
      return
    }
    setFormData((prev) => ({
      ...prev,
      prescriptionData: prev.prescriptionData.filter((_, i) => i !== index),
    }))
  }

  const handlePrescriptionDataChange = (
    index: number,
    field: keyof PatientPrescriptionDataRequest,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      prescriptionData: prev.prescriptionData.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }))
  }

  const validateForm = (): boolean => {
    // Validate prescription name
    if (!formData.prescriptionName.trim()) {
      toast.error("Prescription name is required")
      return false
    }
    if (formData.prescriptionName.length > 200) {
      toast.error("Prescription name must not exceed 200 characters")
      return false
    }

    // Validate images
    if (formData.imageFiles.length === 0) {
      toast.error("At least one prescription image is required")
      return false
    }

    // Validate prescription data entries
    if (formData.prescriptionData.length === 0) {
      toast.error("At least one prescription entry is required")
      return false
    }

    for (let i = 0; i < formData.prescriptionData.length; i++) {
      const entry = formData.prescriptionData[i]

      if (!entry.bloodSugarLevel.trim()) {
        toast.error(`Blood sugar level is required for entry ${i + 1}`)
        return false
      }

      if (!/^\d+(\.\d+)?$/.test(entry.bloodSugarLevel)) {
        toast.error(`Blood sugar level must be a valid number for entry ${i + 1}`)
        return false
      }

      if (!entry.readingType) {
        toast.error(`Reading type is required for entry ${i + 1}`)
        return false
      }

      if (!entry.measurementDate) {
        toast.error(`Measurement date is required for entry ${i + 1}`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get session token
      const session = await fetch('/api/auth/session').then(res => res.json())
      if (!session?.accessToken) {
        toast.error("Authentication required. Please log in again.")
        return
      }

      // Prepare request matching backend PatientPrescriptionCreateRequest
      const request: PatientPrescriptionCreateRequest = {
        prescriptionName: formData.prescriptionName,
        imageURLS: [], // Will be filled by backend after upload
        prescriptionData: formData.prescriptionData.map(entry => ({
          bloodSugarLevel: entry.bloodSugarLevel,
          readingType: entry.readingType,
          measurementDate: entry.measurementDate,
          bloodSugarCategory: entry.bloodSugarCategory,
        })),
      }

      // Call API with form data and files
      await prescriptionService.createPrescription(
        request,
        session.accessToken,
        formData.imageFiles
      )

      toast.success("Prescription created successfully!")

      // Reset form
      setFormData({
        prescriptionName: "",
        imageFiles: [],
        prescriptionData: [
          {
            bloodSugarLevel: "",
            readingType: "",
            measurementDate: "",
            bloodSugarCategory: "",
          },
        ],
      })

      // Clean up preview URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
      setImagePreviews([])
      setIsCreateModalOpen(false)

      // Refresh prescriptions list
      const response = await prescriptionService.getMyGeneralPrescriptions(session.accessToken)
      const generalData: PrescriptionGeneralData[] = response.map((prescription: any) => ({
        id: prescription.id || '',
        userId: prescription.userId || '',
        userProfileId: prescription.userProfileId || '',
        prescriptionName: prescription.prescriptionName || 'Unnamed Prescription',
        doctorId: prescription.doctorId || '',
        status: prescription.status || 'PENDING',
        accessStatus: prescription.accessStatus || null,
        createdAt: prescription.createdAt || new Date().toISOString(),
        updatedAt: prescription.updatedAt || new Date().toISOString(),
      }))
      setPrescriptions(generalData)

    } catch (error) {
      console.error("Error creating prescription:", error)
      toast.error("Failed to create prescription. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    // Clean up preview URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url))

    setFormData({
      prescriptionName: "",
      imageFiles: [],
      prescriptionData: [
        {
          bloodSugarLevel: "",
          readingType: "",
          measurementDate: "",
          bloodSugarCategory: "",
        },
      ],
    })
    setImagePreviews([])
  }

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
      month: "short",
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

  // Handle authentication states
  if (status === "loading") {
    return <LoadingState />
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-orange-600 mb-2">Authentication Required</h2>
            <p className="mb-4">Please log in to view your prescriptions.</p>
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
                onClick={() => router.push("/dashboard")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Prescriptions</h1>
                <p className="text-sm text-gray-500">
                  View and manage all your medical prescriptions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? "s" : ""}
              </div>
              <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                setIsCreateModalOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Prescription
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Prescription</DialogTitle>
                    <DialogDescription>
                      Add your blood sugar readings and prescription information
                    </DialogDescription>
                  </DialogHeader>
                  <CreatePrescriptionForm
                    formData={formData}
                    setFormData={setFormData}
                    imagePreviews={imagePreviews}
                    handleImageUpload={handleImageUpload}
                    handleRemoveImage={handleRemoveImage}
                    handlePrescriptionDataChange={handlePrescriptionDataChange}
                    handleAddPrescriptionEntry={handleAddPrescriptionEntry}
                    handleRemovePrescriptionEntry={handleRemovePrescriptionEntry}
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search prescriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "ALL" ? "default" : "outline"}
              onClick={() => setFilterStatus("ALL")}
              className="min-w-[80px]"
            >
              All
            </Button>
            <Button
              variant={filterStatus === "ACTIVE" ? "default" : "outline"}
              onClick={() => setFilterStatus("ACTIVE")}
              className="min-w-[80px]"
            >
              Active
            </Button>
            <Button
              variant={filterStatus === "PENDING" ? "default" : "outline"}
              onClick={() => setFilterStatus("PENDING")}
              className="min-w-[80px]"
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "COMPLETED" ? "default" : "outline"}
              onClick={() => setFilterStatus("COMPLETED")}
              className="min-w-[100px]"
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingGrid />
        ) : filteredPrescriptions.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onStatusClick={getStatusColor}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Prescription Card Component
function PrescriptionCard({
  prescription,
  onStatusClick,
  formatDate,
  formatTime,
}: {
  prescription: PrescriptionGeneralData
  onStatusClick: (status: string) => string
  formatDate: (date: string) => string
  formatTime: (date: string) => string
}) {
  const router = useRouter()

  const handleCardClick = () => {
    // Navigate to detail page which will call getMyDetailPrescription API
    router.push(`/dashboard/prescriptions/${prescription.id}`)
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
          <FileText className="w-16 h-16 mb-2" />
          <p className="text-sm">Prescription Document</p>
        </div>
        <Badge
          className={`absolute top-3 right-3 ${onStatusClick(prescription.status)} border`}
        >
          {prescription.status}
        </Badge>
      </div>
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {prescription.prescriptionName}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatDate(prescription.createdAt)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatTime(prescription.createdAt)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
            onClick={(e) => {
              e.stopPropagation() // Prevent double navigation
              handleCardClick()
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LoadingGrid />
      </div>
    </div>
  )
}

// Loading Grid Component
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-5">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Empty State Component
function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <FileText className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchQuery ? "No prescriptions found" : "No prescriptions yet"}
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        {searchQuery
          ? `We couldn't find any prescriptions matching "${searchQuery}". Try a different search term.`
          : "You don't have any prescriptions yet. They will appear here once your doctor creates them."}
      </p>
      {searchQuery && (
        <Button variant="outline" onClick={() => window.location.reload()}>
          Clear Search
        </Button>
      )}
    </div>
  )
}

// Create Prescription Form Component
function CreatePrescriptionForm({
  formData,
  setFormData,
  imagePreviews,
  handleImageUpload,
  handleRemoveImage,
  handlePrescriptionDataChange,
  handleAddPrescriptionEntry,
  handleRemovePrescriptionEntry,
  handleSubmit,
  isSubmitting,
}: {
  formData: PrescriptionFormData
  setFormData: React.Dispatch<React.SetStateAction<PrescriptionFormData>>
  imagePreviews: string[]
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveImage: (index: number) => void
  handlePrescriptionDataChange: (
    index: number,
    field: keyof PatientPrescriptionDataRequest,
    value: string
  ) => void
  handleAddPrescriptionEntry: () => void
  handleRemovePrescriptionEntry: (index: number) => void
  handleSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prescription Name */}
      <div className="space-y-2">
        <Label htmlFor="prescriptionName">
          Prescription Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="prescriptionName"
          placeholder="e.g., Diabetes Management - Monthly Checkup"
          value={formData.prescriptionName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, prescriptionName: e.target.value }))
          }
          maxLength={200}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          {formData.prescriptionName.length}/200 characters
        </p>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>
          Prescription Images <span className="text-red-500">*</span>
        </Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <label
            htmlFor="imageUpload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Click to upload prescription images
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</p>
          </label>
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500">
          {imagePreviews.length} image{imagePreviews.length !== 1 ? "s" : ""} uploaded
        </p>
      </div>

      {/* Prescription Data Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">
            Blood Sugar Readings <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPrescriptionEntry}
            className="text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Reading
          </Button>
        </div>

        {formData.prescriptionData.map((entry, index) => (
          <Card key={index} className="p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Reading #{index + 1}</h4>
              {formData.prescriptionData.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePrescriptionEntry(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blood Sugar Level */}
              <div className="space-y-2">
                <Label htmlFor={`bloodSugarLevel-${index}`}>
                  Blood Sugar Level (mg/dL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`bloodSugarLevel-${index}`}
                  type="text"
                  placeholder="e.g., 140"
                  value={entry.bloodSugarLevel}
                  onChange={(e) =>
                    handlePrescriptionDataChange(index, "bloodSugarLevel", e.target.value)
                  }
                />
              </div>

              {/* Reading Type */}
              <div className="space-y-2">
                <Label htmlFor={`readingType-${index}`}>
                  Reading Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={entry.readingType}
                  onValueChange={(value) =>
                    handlePrescriptionDataChange(index, "readingType", value)
                  }
                >
                  <SelectTrigger id={`readingType-${index}`}>
                    <SelectValue placeholder="Select reading type" />
                  </SelectTrigger>
                  <SelectContent>
                    {READING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Measurement Date */}
              <div className="space-y-2">
                <Label htmlFor={`measurementDate-${index}`}>
                  Measurement Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`measurementDate-${index}`}
                  type="date"
                  value={entry.measurementDate}
                  onChange={(e) =>
                    handlePrescriptionDataChange(index, "measurementDate", e.target.value)
                  }
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Blood Sugar Category */}
              <div className="space-y-2">
                <Label htmlFor={`bloodSugarCategory-${index}`}>Blood Sugar Category</Label>
                <Select
                  value={entry.bloodSugarCategory}
                  onValueChange={(value) =>
                    handlePrescriptionDataChange(index, "bloodSugarCategory", value)
                  }
                >
                  <SelectTrigger id={`bloodSugarCategory-${index}`}>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_SUGAR_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {}}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Prescription
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
