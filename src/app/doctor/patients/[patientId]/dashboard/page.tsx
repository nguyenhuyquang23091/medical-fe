"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import {
  Search,
  BarChart3,
  FileText,
  Calendar,
  Phone,
  User,
  Download,
  TestTube,
  Syringe,
  FileX,
  ArrowLeft,
  Shield,
  MapPin,
  Star
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/app/context/AuthContext"
import patientService from "@/actions/patient/patientActions"
import { Patient } from "@/types"
import { toast } from "sonner"

const bloodSugarDataSets = {
  "Past 7 Days": [
    { date: "Aug 1", value: 88, color: "#10b981" }, // normal
    { date: "Aug 2", value: 95, color: "#10b981" }, // normal
    { date: "Aug 3", value: 102, color: "#10b981" }, // normal
    { date: "Aug 4", value: 75, color: "#10b981" }, // normal
    { date: "Aug 5", value: 148, color: "#ef4444" }, // high
    { date: "Aug 6", value: 65, color: "#f59e0b" }, // low
    { date: "Aug 7", value: 92, color: "#10b981" }, // normal
  ],
  "Past 30 Days": [
    { date: "Jul 24", value: 45, color: "#f59e0b" }, // low
    { date: "Jul 25", value: 68, color: "#f59e0b" }, // low
    { date: "Jul 26", value: 85, color: "#10b981" }, // normal
    { date: "Jul 27", value: 92, color: "#10b981" }, // normal
    { date: "Jul 28", value: 78, color: "#10b981" }, // normal
    { date: "Jul 29", value: 155, color: "#ef4444" }, // high
    { date: "Jul 30", value: 168, color: "#ef4444" }, // high
    { date: "Jul 31", value: 52, color: "#f59e0b" }, // low
    { date: "Aug 1", value: 88, color: "#10b981" }, // normal
    { date: "Aug 2", value: 95, color: "#10b981" }, // normal
    { date: "Aug 3", value: 102, color: "#10b981" }, // normal
    { date: "Aug 4", value: 75, color: "#10b981" }, // normal
    { date: "Aug 5", value: 148, color: "#ef4444" }, // high
    { date: "Aug 6", value: 65, color: "#f59e0b" }, // low
  ],
}

const latestResults = [
  {
    id: 1,
    type: "Laboratory find",
    icon: TestTube,
    date: "04.05.2022",
    department: "Diagnostic Center",
    doctor: "Dr. Emma Green",
    diagnosis: "General Examination (20008)",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    type: "COVID-19 vaccination sheet",
    icon: Syringe,
    date: "12.04.2022",
    department: "Infectology",
    doctor: "Dr. Jake Peters",
    diagnosis: "Sine Morbo (09999)",
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    id: 3,
    type: "Outpatient sheet",
    icon: FileX,
    date: "20.12.2021",
    department: "Internal Medicine",
    doctor: "Dr. Monika Buckley",
    diagnosis: "Diabetes (61460)",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
  },
]

// Mock patient data mapping - comprehensive profiles
const patientProfiles = {
  "1": {
    firstName: "Stephan",
    lastName: "Bastian",
    userId: "SB456789",
    avatar: null,
    id: "06/04/1959 | Male | MRN 456789",
    phone: "(701) 293-4945",
    address: "200 Oak Ridge Cir, Brighton, MI 48116",
    eligibility: "Eligible",
    pcp: "Dawn Baker, MD",
    acuityRiskLevel: "Moderate",
    subscriberId: "C254123454",
    practice: "Mayo Clinic"
  },
  "2": {
    firstName: "Kaiya",
    lastName: "Workman",
    userId: "KW789012",
    avatar: null,
    id: "03/15/1992 | Female | MRN 789012",
    phone: "(555) 123-4567",
    address: "123 Main St, Detroit, MI 48201",
    eligibility: "Eligible",
    pcp: "Dr. Sarah Johnson",
    acuityRiskLevel: "Low",
    subscriberId: "K987654321",
    practice: "Detroit Medical Center"
  },
  "3": {
    firstName: "Justin",
    lastName: "Lipshutz",
    userId: "JL345678",
    avatar: null,
    id: "07/22/1985 | Male | MRN 345678",
    phone: "(555) 987-6543",
    address: "456 Elm Ave, Ann Arbor, MI 48104",
    eligibility: "Eligible",
    pcp: "Dr. Michael Chen",
    acuityRiskLevel: "High",
    subscriberId: "J123456789",
    practice: "University Hospital"
  },
  "4": {
    firstName: "Maren",
    lastName: "Torff",
    userId: "MT901234",
    avatar: null,
    id: "12/03/1978 | Female | MRN 901234",
    phone: "(555) 456-7890",
    address: "789 Oak St, Lansing, MI 48912",
    eligibility: "Eligible",
    pcp: "Dr. Lisa Wang",
    acuityRiskLevel: "Moderate",
    subscriberId: "M456789012",
    practice: "Sparrow Hospital"
  },
  "5": {
    firstName: "Angel",
    lastName: "Rhiel Madsen",
    userId: "ARM567890",
    avatar: null,
    id: "09/18/1990 | Female | MRN 567890",
    phone: "(555) 234-5678",
    address: "321 Pine Rd, Grand Rapids, MI 49503",
    eligibility: "Eligible",
    pcp: "Dr. Robert Smith",
    acuityRiskLevel: "Low",
    subscriberId: "A789012345",
    practice: "Spectrum Health"
  },
  "6": {
    firstName: "Clark",
    lastName: "Champin",
    userId: "CC123456",
    avatar: null,
    id: "04/10/1965 | Male | MRN 123456",
    phone: "(555) 345-6789",
    address: "654 Maple Dr, Kalamazoo, MI 49001",
    eligibility: "Pending",
    pcp: "Dr. Jennifer Davis",
    acuityRiskLevel: "High",
    subscriberId: "C012345678",
    practice: "Bronson Healthcare"
  },
  "7": {
    firstName: "Rogelio",
    lastName: "Farrell",
    userId: "RF789123",
    avatar: null,
    id: "11/25/1982 | Male | MRN 789123",
    phone: "(555) 567-8901",
    address: "987 Cedar Ln, Flint, MI 48502",
    eligibility: "Eligible",
    pcp: "Dr. Amanda Wilson",
    acuityRiskLevel: "Moderate",
    subscriberId: "R345678901",
    practice: "McLaren Health"
  }
}

export default function PatientDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const [bloodSugarPeriod, setBloodSugarPeriod] = useState("Past 7 Days")
  const [currentData, setCurrentData] = useState(bloodSugarDataSets["Past 7 Days"])
  const [isLoading, setIsLoading] = useState(true)
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load real patient profile from API
    const loadPatientData = async () => {
      if (!session?.accessToken || !params.patientId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        console.log('Loading patient data for ID:', params.patientId)
        const patient = await patientService.getPatientById(
          params.patientId as string,
          session.accessToken
        )

        console.log('Patient data loaded:', patient)
        setPatientProfile(patient)
      } catch (error: any) {
        console.error('Failed to load patient data:', error)
        setError('Failed to load patient data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPatientData()
  }, [params.patientId, session?.accessToken])

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setCurrentData(bloodSugarDataSets[bloodSugarPeriod as keyof typeof bloodSugarDataSets])
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [bloodSugarPeriod])

  const calculateStats = (data: typeof currentData) => {
    const allValues = data.map((d) => d.value)
    const recentReading = allValues[allValues.length - 1] || 0
    const average = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0
    return { recentReading, average }
  }

  const { recentReading, average } = calculateStats(currentData)

  const handleBackToPatients = () => {
    router.push(`/doctor/patients`)
  }

  const handleViewAllPrescriptions = () => {
    router.push(`/doctor/patients/${params.patientId}/prescriptions`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded w-96"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !patientProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Patient not found'}
          </h1>
          <Button onClick={() => router.push('/doctor/patients')}>
            Back to Patients List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToPatients}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Patients
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-semibold text-gray-900">MedConnect</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search" className="pl-10 w-64 bg-gray-100 border-0" />
          </div>
        </div>
      </header>

      <div className="min-h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {patientProfile.firstName} {patientProfile.lastName}'s Health Dashboard
            </h1>
            <p className="text-gray-600">Comprehensive health overview. Click "See All Prescriptions" to view detailed records.</p>
          </div>

          {/* Patient Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Patient Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={patientProfile.avatar || "/images/patient-placeholder.jpg"} />
                    <AvatarFallback className="text-lg">
                      {patientProfile.firstName[0]}{patientProfile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Patient Info */}
                <div className="flex-1 grid gap-6 lg:grid-cols-3">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold">{patientProfile.firstName} {patientProfile.lastName}</h2>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {patientProfile.id}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>User ID: {patientProfile.userId}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{patientProfile.city || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Role</h3>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {patientProfile.role}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</h3>
                      <p className="text-sm">{patientProfile.dob || 'N/A'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">City</h3>
                      <p className="text-sm">{patientProfile.city || 'N/A'}</p>
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
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Profile ID</h3>
                      <p className="text-sm">{patientProfile.id}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Dashboard Access</h3>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Public View
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blood Sugar Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <CardTitle className="text-xl font-semibold">Blood Sugar</CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                <Select defaultValue="MG/DL">
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MG/DL">MG/DL</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bloodSugarPeriod} onValueChange={setBloodSugarPeriod}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Past 7 Days">Past 7 Days</SelectItem>
                    <SelectItem value="Past 30 Days">Past 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-8 mb-6">
                <div>
                  <div
                    className={`text-3xl font-bold transition-all duration-300 ${isLoading ? "opacity-50" : "opacity-100"}`}
                  >
                    {recentReading.toFixed(1)} <span className="text-sm font-normal text-gray-500">mg/dl</span>
                  </div>
                  <div className="text-sm text-gray-600">Recent Reading</div>
                </div>
                <div>
                  <div
                    className={`text-3xl font-bold transition-all duration-300 ${isLoading ? "opacity-50" : "opacity-100"}`}
                  >
                    {average.toFixed(1)} <span className="text-sm font-normal text-gray-500">mg/dl</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {bloodSugarPeriod === "Past 7 Days" ? "7" : "30"} Day Average
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-amber-500"></div>
                  <span className="text-gray-600">Low (&lt;70)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span className="text-gray-600">Normal (70-140)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-gray-600">High (&gt;140)</span>
                </div>
              </div>

              <div
                className={`transition-all duration-300 ${isLoading ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
              >
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={currentData}>
                    <Tooltip
                      content={(props) => {
                        if (!props.active || !props.payload || props.payload.length === 0) {
                          return null
                        }
                        const data = props.payload[0].payload
                        const getRange = (value: number | undefined) => {
                          if (value === undefined) return "Unknown"
                          if (value < 70) return "Low"
                          if (value > 140) return "High"
                          return "Normal"
                        }
                        return (
                          <div className="bg-gray-900 text-white py-2 px-4 rounded-md shadow-lg">
                            <p className="font-medium">{data.date}</p>
                            <p>Blood Sugar: {data.value} mg/dl</p>
                            <p className="text-sm opacity-75">Range: {getRange(data.value)}</p>
                          </div>
                        )
                      }}
                    />
                    <YAxis
                      dataKey="value"
                      width={48}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {currentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-end mt-4">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">See Insights</Button>
              </div>
            </CardContent>
          </Card>

          {/* Latest Results Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <CardTitle className="text-xl font-semibold">Latest Prescriptions</CardTitle>
              </div>
              <Button
                variant="ghost"
                className="text-blue-500 hover:text-blue-600 text-sm"
                onClick={handleViewAllPrescriptions}
              >
                See All Prescriptions
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-3 pb-3 border-b border-gray-200 text-xs font-medium text-gray-500 min-w-[600px]">
                  <div>Document type</div>
                  <div>Date</div>
                  <div>Health department</div>
                  <div>Doctor</div>
                  <div>Diagnosis</div>
                  <div>Download</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-2 mt-4 min-w-[600px]">
                  {latestResults.map((result) => {
                    const IconComponent = result.icon
                    return (
                      <div
                        key={result.id}
                        className="grid grid-cols-6 gap-3 items-center py-2 hover:bg-gray-50 rounded-lg px-2"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${result.bgColor} rounded flex items-center justify-center`}>
                            <IconComponent className={`w-4 h-4 ${result.iconColor}`} />
                          </div>
                          <span className="text-sm font-medium">{result.type}</span>
                        </div>
                        <div className="text-xs text-gray-600">{result.date}</div>
                        <div className="text-xs text-gray-600">{result.department}</div>
                        <div className="text-xs text-gray-600">{result.doctor}</div>
                        <div className="text-xs text-gray-600">{result.diagnosis}</div>
                        <div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                            <Download className="w-4 h-4 text-blue-500" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}