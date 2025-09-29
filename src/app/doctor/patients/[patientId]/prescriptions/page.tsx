"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, FileText, Calendar, User, Shield, Phone, MapPin, Star, Loader2, CheckCircle, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PrescriptionGeneralData, Patient } from "@/types"
import { useAuth } from "@/app/context/AuthContext"
import patientService from "@/actions/patient/patientActions"
import prescriptionService from "@/actions/profile/prescription"

export default function PatientPrescriptionsPage() {
    const params = useParams()
    const router = useRouter()
    const { session } = useAuth()
    const [prescriptions, setPrescriptions] = useState<PrescriptionGeneralData[]>([])
    const [loading, setLoading] = useState(true)
    const [patientInfo, setPatientInfo] = useState<Patient | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [requestingAccessId, setRequestingAccessId] = useState<string | null>(null)
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'loading' | 'success' | 'error';
        title: string;
        message: string;
        prescriptionName?: string;
    }>({
        isOpen: false,
        type: 'loading',
        title: '',
        message: '',
    })
    const [currentLoadingStep, setCurrentLoadingStep] = useState(0)

    const loadingSteps = [
        { message: "Preparing request...", duration: 800 },
        { message: "Encrypting patient data...", duration: 1000 },
        { message: "Connecting to patient portal...", duration: 900 },
        { message: "Sending notification...", duration: 700 },
        { message: "Finalizing request...", duration: 600 },
    ]


    const loadPatientData = async () => {
        if (!session?.accessToken || !params.patientId) {
            setError("No access token or patient ID available")
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            setError(null)

            console.log("Loading patient data with userId:", params.patientId)
            console.log("Using access token:", session.accessToken ? "Present" : "Missing")

            // Load patient info first (params.patientId is actually userId now)
            const patient = await patientService.getPatientById(params.patientId as string, session.accessToken)
            console.log("Patient loaded successfully:", patient)
            setPatientInfo(patient)

            // Then load prescriptions using the patient's user ID
            console.log("Loading prescriptions for patient userId:", patient.userId)
            const prescriptions = await prescriptionService.getPatientPrescriptionsList(patient.userId, session.accessToken)
            console.log("Prescriptions loaded successfully:", prescriptions)
            setPrescriptions(prescriptions)

        } catch (error) {
            console.error("Failed to load patient data:", error)
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as any
                console.error("API Error details:", {
                    status: apiError.response?.status,
                    statusText: apiError.response?.statusText,
                    data: apiError.response?.data,
                    url: apiError.config?.url
                })
            }
            setError("Failed to load patient information. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.accessToken) {
            loadPatientData()
        }
    }, [session?.accessToken, params.patientId])

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'inactive':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const runLoadingSteps = async () => {
        setCurrentLoadingStep(0)

        // Step through loading messages
        let totalTime = 0
        loadingSteps.forEach((step, index) => {
            totalTime += step.duration
            setTimeout(() => {
                setCurrentLoadingStep(index)
            }, totalTime)
        })

        // Wait for the total duration
        await new Promise(resolve => setTimeout(resolve, totalTime + 200))
    }

    const handleRequestAccess = async (prescription: PrescriptionGeneralData) => {
        if (!session?.accessToken || !patientInfo) {
            setError("No access token or patient information available")
            return
        }

        try {
            setRequestingAccessId(prescription.id)
            setError(null) // Clear any previous errors

            // Show loading modal immediately
            setModalState({
                isOpen: true,
                type: 'loading',
                title: 'Sending Request...',
                message: `Please wait while we send your access request to ${patientInfo.firstName}.`,
                prescriptionName: prescription.prescriptionName
            })

            console.log('Requesting access to prescription:', prescription.prescriptionName)
            console.log('Prescription ID:', prescription.id)
            console.log('Patient User ID:', patientInfo.userId)

            // Start API call and loading steps in parallel
            const apiCallPromise = prescriptionService.createPrescriptionAccess(
                patientInfo.userId,
                prescription.id,
                session.accessToken
            )

            const loadingStepsPromise = runLoadingSteps()

            // Wait for both API call and loading steps to complete
            const [accessRequest] = await Promise.all([apiCallPromise, loadingStepsPromise])

            console.log('Prescription access request created:', accessRequest)

            // Show success modal after loading phase completes
            setModalState({
                isOpen: true,
                type: 'success',
                title: 'Request Sent!',
                message: `Your access request has been sent to ${patientInfo.firstName}. You'll be notified once they respond.`,
                prescriptionName: prescription.prescriptionName
            })

            // Auto-close success modal after 1.5 seconds
            setTimeout(() => {
                setModalState(prev => ({ ...prev, isOpen: false }))
            }, 1500)

            // Refresh the prescriptions list to reflect any status changes
            await loadPatientData()
        } catch (error) {
            console.error("Failed to request prescription access:", error)

            // Show error modal (no timing restrictions for errors)
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Request Failed',
                message: 'Failed to send access request. Please try again.',
                prescriptionName: prescription.prescriptionName
            })
        } finally {
            setRequestingAccessId(null)
        }
    }

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }))
        // Reset loading state
        setCurrentLoadingStep(0)
    }

    const handleBackToPatients = () => {
        router.push('/doctor/patients')
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Prescriptions</h1>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={loadPatientData}>
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToPatients}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Patients
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Prescriptions</h1>
                        <p className="text-muted-foreground">Patient prescription overview</p>
                    </div>
                </div>
               
            </div>

            {/* Patient Profile Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        {/* Patient Avatar */}
                        <div className="flex-shrink-0">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={patientInfo?.avatar || "/images/patient-placeholder.jpg"} />
                                <AvatarFallback className="text-lg">
                                    {patientInfo ? `${patientInfo.firstName[0]}${patientInfo.lastName[0]}` : 'P'}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 grid gap-6 lg:grid-cols-3">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-xl font-bold">
                                            {patientInfo ? `${patientInfo.firstName} ${patientInfo.lastName}` : 'Loading...'}
                                        </h2>
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {patientInfo ? `ID: ${patientInfo.id} | ${patientInfo.dob} | ${patientInfo.role}` : 'Loading...'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{patientInfo?.userId || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{patientInfo?.city || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Column */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Role</h3>
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                        {patientInfo?.role || 'N/A'}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</h3>
                                    <p className="text-sm">{patientInfo?.dob || 'N/A'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">City</h3>
                                    <p className="text-sm">{patientInfo?.city || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Patient Profile</p>
                                        <p className="text-xs text-muted-foreground">Healthcare System</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">User ID</h3>
                                    <p className="text-sm">{patientInfo?.userId || 'N/A'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Profile ID</h3>
                                    <p className="text-sm">{patientInfo?.id || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Prescriptions Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {prescriptions.map((prescription, index) => (
                    <Card
                        key={index}
                        className={`hover:shadow-lg transition-all duration-200 ${
                            requestingAccessId === prescription.id
                                ? 'ring-2 ring-blue-200 shadow-lg bg-blue-50/30'
                                : ''
                        }`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-lg">{prescription.prescriptionName}</CardTitle>
                                    {requestingAccessId === prescription.id && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
                                            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                            <span className="text-xs text-blue-600 font-medium">Processing</span>
                                        </div>
                                    )}
                                </div>
                                <Badge className={getStatusColor(prescription.status)}>
                                    {prescription.status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>Doctor ID: {prescription.doctorId}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Created: {formatDate(prescription.createdAt)}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Updated: {formatDate(prescription.updatedAt)}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button
                                    className="w-full flex items-center gap-2 cursor-pointer transition-all duration-200"
                                    onClick={() => handleRequestAccess(prescription)}
                                    variant="outline"
                                    disabled={loading || requestingAccessId === prescription.id}
                                >
                                    {requestingAccessId === prescription.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processing Request...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4" />
                                            Request Access
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {prescriptions.length === 0 && !loading && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Prescriptions Found</h3>
                        <p className="text-gray-500 text-center">
                            This patient currently has no general prescriptions available.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Access Request Modal */}
            <Dialog open={modalState.isOpen} onOpenChange={modalState.type === 'loading' ? undefined : closeModal}>
                <DialogContent
                    className="sm:max-w-md"
                    showCloseButton={modalState.type !== 'loading'}
                >
                    {modalState.type === 'loading' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{modalState.title}</DialogTitle>
                                <DialogDescription>
                                    {modalState.message}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center py-6 space-y-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    </div>
                                    <div className="absolute inset-0 w-16 h-16 bg-blue-200 rounded-full animate-ping opacity-20"></div>
                                </div>

                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-semibold text-foreground">Processing Request</h3>
                                    <p className="text-muted-foreground min-h-[20px] transition-all duration-300">
                                        {loadingSteps[currentLoadingStep]?.message || "Processing"}
                                    </p>
                                </div>

                                <div className="w-full max-w-xs space-y-3">
                                    <div className="text-center text-xs text-muted-foreground">
                                        Step {currentLoadingStep + 1} of {loadingSteps.length}
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        {loadingSteps.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                    index <= currentLoadingStep ? "bg-blue-600" : "bg-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {modalState.type === 'success' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{modalState.title}</DialogTitle>
                                <DialogDescription>
                                    {modalState.message}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center py-6 space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                            </div>
                        </>
                    )}

                    {modalState.type === 'error' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{modalState.title}</DialogTitle>
                                <DialogDescription>
                                    {modalState.message}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center py-6 space-y-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <X className="w-8 h-8 text-red-600" />
                                </div>
                                <div className="pt-4">
                                    <Button onClick={closeModal} variant="outline" className="w-full">
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}