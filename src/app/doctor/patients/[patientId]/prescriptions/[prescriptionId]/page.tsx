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
  Edit,
  Trash2,
  Save,
  Plus,
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
import { useAuth } from "@/app/context/AuthContext"
import prescriptionService from "@/actions/profile/prescription"
import patientService from "@/actions/patient/patientActions"
import { toast } from "sonner"
import { Patient } from "@/types"
import { DoctorPrescriptionUpdateRequest, DoctorPrescriptionDataUpdate } from "@/types/prescription"

// Type definitions matching backend model
interface PrescriptionData {
  medicationName?: string
  dosage?: string
  frequency?: string
  instructions?: string
  doctorNotes?: string
  bloodSugarLevel?: string
  readingType?: string
  bloodSugarCategory?: string
  measurementDate?: string
}

interface PrescriptionResponse {
  id: string
  userId: string
  userProfileId: string
  prescriptionName?: string
  imageURLS?: string[]
  prescriptionData: PrescriptionData[]
  doctorId: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function DoctorPrescriptionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = params.patientId as string
  const prescriptionId = params.prescriptionId as string
  const { session } = useAuth()

  const [prescription, setPrescription] = useState<PrescriptionResponse | null>(null)
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Edit and Delete state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Medication form state (array of medications)
  const [medications, setMedications] = useState<DoctorPrescriptionDataUpdate[]>([
    {
      medicationName: "",
      dosage: "",
      frequency: "",
      instructions: "",
      doctorNotes: "",
    }
  ])

  // Fetch prescription and patient data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!session?.accessToken) {
          setError("Authentication required")
          toast.error("Please log in to view prescription details")
          return
        }

        console.log('Fetching prescription details for patient:', patientId, 'prescription:', prescriptionId)

        // Fetch patient info
        const patient = await patientService.getPatientById(patientId, session.accessToken)
        setPatientInfo(patient)

        // Call getOnePatientDetailPrescription API with patient userId and prescription ID
        const response = await prescriptionService.getOnePatientDetailPrescription(
          patient.userId,
          prescriptionId,
          session.accessToken
        )

        console.log('Prescription detail response:', response)
        console.log('Image URLs from API:', response.imageURLS)
        console.log('Prescription Data from API:', response.prescriptionData)

        // Validate response
        if (!response) {
          throw new Error('No data returned from API')
        }

        setPrescription(response)
      } catch (err) {
        console.error("Error fetching prescription details:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load prescription details"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.accessToken && patientId && prescriptionId) {
      fetchData()
    }
  }, [patientId, prescriptionId, session?.accessToken])

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
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
    if (prescription && prescription.imageURLS && prescription.imageURLS.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % prescription.imageURLS!.length)
    }
  }

  const handlePrevImage = () => {
    if (prescription && prescription.imageURLS && prescription.imageURLS.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? prescription.imageURLS!.length - 1 : prev - 1
      )
    }
  }

  const handleBackToPrescriptions = () => {
    router.push(`/doctor/patients/${patientId}/prescriptions`)
  }

  const handleOpenEditModal = () => {
    if (prescription) {
      // Initialize medications with existing doctor prescriptions (only medication data)
      const existingMedications = prescription.prescriptionData
        .filter(data => data.medicationName) // Only get medication entries
        .map(data => ({
          medicationName: data.medicationName || "",
          dosage: data.dosage || "",
          frequency: data.frequency || "",
          instructions: data.instructions || "",
          doctorNotes: data.doctorNotes || "",
        }))

      // If there are existing medications, use them; otherwise start with one empty entry
      setMedications(existingMedications.length > 0 ? existingMedications : [
        {
          medicationName: "",
          dosage: "",
          frequency: "",
          instructions: "",
          doctorNotes: "",
        }
      ])
      setIsEditModalOpen(true)
    }
  }

  const handleAddMedication = () => {
    setMedications([...medications, {
      medicationName: "",
      dosage: "",
      frequency: "",
      instructions: "",
      doctorNotes: "",
    }])
  }

  const handleRemoveMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const handleMedicationChange = (index: number, field: keyof DoctorPrescriptionDataUpdate, value: string) => {
    const updatedMedications = [...medications]
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    }
    setMedications(updatedMedications)
  }

  const handleUpdatePrescription = async () => {
    if (!prescription) return

    // Validate that all medications have required fields
    const invalidMedications = medications.filter(
      med => !med.medicationName.trim() || !med.dosage.trim() || !med.frequency.trim()
    )

    if (invalidMedications.length > 0) {
      toast.error("Please fill in all required fields (Medication Name, Dosage, Frequency) for each medication")
      return
    }

    try {
      setIsSaving(true)

      if (!session?.accessToken) {
        toast.error("Authentication required")
        return
      }

      const updateRequest: DoctorPrescriptionUpdateRequest = {
        prescriptionData: medications
      }

      await prescriptionService.doctorUpdatePrescription(
        prescriptionId,
        updateRequest,
        session.accessToken
      )

      toast.success("Prescription updated successfully")
      setIsEditModalOpen(false)

      // Refresh prescription data
      if (patientInfo) {
        const refreshed = await prescriptionService.getOnePatientDetailPrescription(
          patientInfo.userId,
          prescriptionId,
          session.accessToken
        )
        setPrescription(refreshed)
      }
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

      if (!session?.accessToken) {
        toast.error("Authentication required")
        return
      }

      await prescriptionService.doctorDeletePrescription(prescriptionId, session.accessToken)

      toast.success("Prescription deleted successfully")
      setIsDeleteDialogOpen(false)

      // Navigate back to prescriptions list
      router.push(`/doctor/patients/${patientId}/prescriptions`)
    } catch (error) {
      console.error("Error deleting prescription:", error)
      toast.error("Failed to delete prescription")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle loading state
  if (isLoading) {
    return <LoadingState />
  }

  if (error || !prescription) {
    return <ErrorState error={error || "Prescription not found"} onBack={handleBackToPrescriptions} />
  }

  const imageUrls = prescription.imageURLS || []

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
                onClick={handleBackToPrescriptions}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {prescription.prescriptionName || "Prescription Details"}
                </h1>
                <p className="text-sm text-gray-500">
                  Patient: {patientInfo ? `${patientInfo.firstName} ${patientInfo.lastName}` : 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEditModal}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Prescription
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
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
            {/* Patient Info Card */}
            {patientInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Patient Name</p>
                        <p className="font-medium text-gray-900">
                          {patientInfo.firstName} {patientInfo.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Patient ID</p>
                        <p className="font-medium text-gray-900 font-mono text-sm">{patientInfo.userId}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium text-gray-900">{patientInfo.dob}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-medium text-gray-900">{patientInfo.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  Medications & Health Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prescription.prescriptionData.length > 0 ? (
                  prescription.prescriptionData.map((data, index) => (
                    <MedicationCard key={index} data={data} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No prescription data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Gallery */}
            {imageUrls.length > 0 ? (
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
                          src={imageUrls[selectedImageIndex]}
                          alt={`Prescription ${selectedImageIndex + 1}`}
                          className="w-full h-auto rounded-lg"
                          style={{
                            display: 'block',
                            maxHeight: '500px',
                            objectFit: 'contain',
                            margin: '0 auto'
                          }}
                          onError={(e) => {
                            console.error('Image failed to load:', imageUrls[selectedImageIndex])
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', imageUrls[selectedImageIndex])
                          }}
                        />
                        <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-all flex items-center justify-center pointer-events-none">
                          <p className="text-gray-800 bg-white/90 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Click to enlarge
                          </p>
                        </div>
                      </div>

                      {imageUrls.length > 1 && (
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
                    {imageUrls.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imageUrls.map((url, index) => (
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
                      {imageUrls.length} image{imageUrls.length !== 1 ? "s" : ""} attached
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
                  <span className="text-gray-600">Total Records</span>
                  <span className="font-semibold">{prescription.prescriptionData.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Images Attached</span>
                  <span className="font-semibold">{imageUrls.length}</span>
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
      {isImageModalOpen && imageUrls.length > 0 && (
        <ImageModal
          imageUrl={imageUrls[selectedImageIndex]}
          onClose={() => setIsImageModalOpen(false)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          currentIndex={selectedImageIndex}
          totalImages={imageUrls.length}
        />
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prescription Medications</DialogTitle>
            <DialogDescription>
              Add or update medication prescriptions for {patientInfo?.firstName} {patientInfo?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {medications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Medication {index + 1}</h3>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`medicationName-${index}`}>
                      Medication Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`medicationName-${index}`}
                      value={medication.medicationName}
                      onChange={(e) => handleMedicationChange(index, 'medicationName', e.target.value)}
                      placeholder="e.g., Metformin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`dosage-${index}`}>
                      Dosage <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`dosage-${index}`}
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`frequency-${index}`}>
                      Frequency <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`frequency-${index}`}
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      placeholder="e.g., Twice daily"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`instructions-${index}`}>Instructions</Label>
                    <Input
                      id={`instructions-${index}`}
                      value={medication.instructions || ""}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`doctorNotes-${index}`}>Doctor Notes</Label>
                  <Textarea
                    id={`doctorNotes-${index}`}
                    value={medication.doctorNotes || ""}
                    onChange={(e) => handleMedicationChange(index, 'doctorNotes', e.target.value)}
                    placeholder="Add any additional notes or recommendations..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddMedication}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another Medication
            </Button>

            <div className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdatePrescription}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prescription
              "{prescription?.prescriptionName || 'this prescription'}" for patient{' '}
              {patientInfo ? `${patientInfo.firstName} ${patientInfo.lastName}` : 'this patient'}.
              All associated data will be removed from the system.
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
              {data.bloodSugarCategory && (
                <div
                  className={`rounded-lg p-4 text-white shadow-md ${
                    data.bloodSugarCategory.toUpperCase() === "HIGH" || data.bloodSugarCategory.toUpperCase() === "VERY_HIGH"
                      ? "bg-gradient-to-br from-red-500 to-red-600"
                      : data.bloodSugarCategory.toUpperCase() === "LOW"
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
                    {data.bloodSugarCategory.toUpperCase().includes("HIGH")
                      ? "Above normal range"
                      : data.bloodSugarCategory.toUpperCase() === "LOW"
                      ? "Below normal range"
                      : "Within normal range"}
                  </p>
                </div>
              )}
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
