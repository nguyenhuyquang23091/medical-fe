"use client"

import React, { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import {
  Search,
  BarChart3,
  FileText,
  Calendar,
  Phone,
  Mail,
  User,
  Download,
  TestTube,
  Syringe,
  FileX
} from "lucide-react"
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
import { useSession } from "next-auth/react"
import { useUserProfile } from "@/app/context/UserProfileContext"
import { ProfilePageSkeleton } from "@/components/ui/profile-loading-skeleton"
import { useRouter } from "next/navigation"

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

export default function DashboardPage() {
  const router = useRouter()
  const { status } = useSession()
  const { userProfile } = useUserProfile()
  const [bloodSugarPeriod, setBloodSugarPeriod] = useState("Past 7 Days")
  const [currentData, setCurrentData] = useState(bloodSugarDataSets["Past 7 Days"])
  const [isLoading, setIsLoading] = useState(false)

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

  // Handle authentication states
  if (status === "loading" || !userProfile) {
    return <ProfilePageSkeleton />
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-orange-600">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to view your dashboard.</p>
            <Button
              onClick={() => window.location.href = "/login"}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-semibold text-gray-900">MedConnect</span>
            </div>
            <span className="text-gray-400">/</span>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Dashboard</span>
            </div>
            <span className="text-gray-400">/</span>
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-900">{userProfile.firstName} {userProfile.lastName}</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search" className="pl-10 w-64 bg-gray-100 border-0" />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userProfile.firstName}!
            </h1>
            <p className="text-gray-600">Here's your health overview for today.</p>
          </div>

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
                onClick={() => router.push("/dashboard/prescriptions")}
              >
                See all
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

        {/* Patient Profile Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 flex-shrink-0">
          <div className="text-right text-sm text-gray-500 mb-4">{userProfile.userId}</div>

          {/* Patient Info */}
          <div className="text-center mb-6">
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{userProfile.firstName} {userProfile.lastName}</h2>
            <p className="text-gray-600 text-sm">Patient</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-6">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Calendar className="w-4 h-4 mr-1" />
              Schedule Visit
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
          </div>

          {/* Upcoming appointments section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Upcoming appointments</h3>

            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Supportive session</p>
                    <p className="text-xs text-gray-600 mt-1">Wed, 24/05/2023</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">12:00 - 1:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Personal Health</p>
                    <p className="text-xs text-gray-600 mt-1">Fri, 26/05/2023</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">1:00 - 2:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm text-gray-900">CBT Session</p>
                    <p className="text-xs text-gray-600 mt-1">Mon, 02/07/2023</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">8:30 - 10:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meet our doctors section */}
          <div className="bg-blue-500 rounded-lg p-4 mb-6 text-white">
            <h3 className="font-medium mb-2">Meet our doctors</h3>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm text-blue-100">
                Continue to look for our expert doctors with confidence in any health issues
              </p>
            </div>
            <Button className="w-full bg-white text-blue-500 hover:bg-blue-50">Schedule appointment</Button>
          </div>
        </div>
      </div>
    </div>
  )
}