"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Search, UserPlus, FileText, MoreHorizontal } from "lucide-react"
import { Patient, PatientFilters } from "@/types"
import { useAuth } from "@/app/context/AuthContext"
import patientService from "@/actions/patient/patientActions"

export default function PatientsPage() {
    const router = useRouter()
    const { session } = useAuth()
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set())
    const [filters, setFilters] = useState<PatientFilters>({
        search: '',
        status: '',
        sortBy: 'name',
        sortOrder: 'asc'
    })

    // Fetch patients from API
    const fetchPatients = async () => {
        if (!session?.accessToken) {
            setError("No access token available")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const patients = await patientService.getAllPatients(session.accessToken)
            console.log("Patient service response:", patients)
            setPatients(patients || [])
        } catch (error) {
            console.error("Failed to fetch patients:", error)
            setError("Failed to load patients. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Filter and sort patients using useMemo for performance
    const filteredPatients = useMemo(() => {
        let result = [...patients]

        // Apply search filter
        if (filters.search) {
            result = result.filter(patient => {
                const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
                return fullName.includes(filters.search!.toLowerCase()) ||
                       patient.id.toLowerCase().includes(filters.search!.toLowerCase())
            })
        }

        // Apply role filter (using role instead of status)
        if (filters.status) {
            result = result.filter(patient => patient.role === filters.status)
        }

        // Apply sorting
        if (filters.sortBy) {
            result.sort((a, b) => {
                let aValue: string
                let bValue: string

                const sortField = filters.sortBy!; // Non-null assertion since we checked above

                if (sortField === 'name') {
                    aValue = `${a.firstName} ${a.lastName}`
                    bValue = `${b.firstName} ${b.lastName}`
                } else if (sortField === 'id') {
                    aValue = a.id
                    bValue = b.id
                } else if (sortField === 'dob') {
                    aValue = a.dob
                    bValue = b.dob
                } else {
                    // This else clause should never be reached given our PatientFilters type
                    aValue = ''
                    bValue = ''
                }

                if (filters.sortOrder === 'desc') {
                    return bValue.localeCompare(aValue)
                }
                return aValue.localeCompare(bValue)
            })
        }

        return result
    }, [patients, filters])

    useEffect(() => {
        if (session?.accessToken) {
            fetchPatients()
        }
    }, [session?.accessToken])

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedPatients(new Set(filteredPatients.map(p => p.id)))
        } else {
            setSelectedPatients(new Set())
        }
    }

    const handleSelectPatient = (patientId: string, checked: boolean) => {
        const newSelected = new Set(selectedPatients)
        if (checked) {
            newSelected.add(patientId)
        } else {
            newSelected.delete(patientId)
        }
        setSelectedPatients(newSelected)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'Non-active':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'New patient':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const handleViewPrescriptions = (patientId: string) => {
        router.push(`/doctor/patients/${patientId}/prescriptions`)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Patients</h1>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={fetchPatients}>
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
                <h1 className="text-3xl font-bold">Patients</h1>
                <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add patient
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Filters</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or #id"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="pl-10"
                                />
                            </div>

                            <Select
                                value={filters.status || "all"}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}
                            >
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="PATIENT">Patient</SelectItem>
                                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Patient List */}
            <Card>
                <CardContent className="p-0">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-600">
                        <div className="col-span-1">
                            <Checkbox
                                checked={selectedPatients.size === filteredPatients.length && filteredPatients.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                        </div>
                        <div className="col-span-3">NAME</div>
                        <div className="col-span-2">ID</div>
                        <div className="col-span-2">ROLE</div>
                        <div className="col-span-2">DATE OF BIRTH</div>
                        <div className="col-span-2">ACTIONS</div>
                    </div>

                    {/* Patient Rows */}
                    <div className="divide-y">
                        {filteredPatients.map((patient) => (
                            <div key={patient.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
                                <div className="col-span-1">
                                    <Checkbox
                                        checked={selectedPatients.has(patient.id)}
                                        onCheckedChange={(checked) => handleSelectPatient(patient.id, !!checked)}
                                    />
                                </div>

                                <div className="col-span-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={patient.avatar} />
                                            <AvatarFallback>
                                                {patient.firstName[0]}{patient.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                                            <p className="text-sm text-gray-500">
                                                {patient.city}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <span className="font-medium">{patient.userId}</span>
                                </div>

                                <div className="col-span-2">
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                        {patient.role}
                                    </Badge>
                                </div>

                                <div className="col-span-2">
                                    <div>
                                        <p className="font-medium">{patient.dob}</p>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewPrescriptions(patient.userId)}
                                            className="flex items-center gap-1 cursor-pointer"
                                        >
                                            <FileText className="h-3 w-3" />
                                            View Prescriptions
                                        </Button>
                                        
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}