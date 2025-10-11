"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, Users, FileText, Bell, BarChart3, Clock } from "lucide-react"

export default function DoctorDashboard() {

    const stats = [
        {
            title: "Today's Appointments",
            value: "12",
            icon: CalendarCheck,
            description: "3 more than yesterday",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Total Patients",
            value: "1,247",
            icon: Users,
            description: "Active patients",
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "Pending Prescriptions",
            value: "8",
            icon: FileText,
            description: "Waiting for review",
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        },
        {
            title: "New Notifications",
            value: "5",
            icon: Bell,
            description: "Unread messages",
            color: "text-red-600",
            bgColor: "bg-red-50"
        }
    ]

    const recentAppointments = [
        { time: "09:00", patient: "John Smith", type: "Checkup", status: "Confirmed" },
        { time: "10:30", patient: "Sarah Johnson", type: "Follow-up", status: "Confirmed" },
        { time: "11:15", patient: "Mike Brown", type: "Consultation", status: "Pending" },
        { time: "14:00", patient: "Emma Davis", type: "Emergency", status: "Urgent" },
        { time: "15:30", patient: "Tom Wilson", type: "Routine", status: "Confirmed" }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Dr. Johnson</p>
            </div>


            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bgColor} p-2 rounded-md`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Today's Appointments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Today's Appointments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentAppointments.map((appointment, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="font-mono text-sm text-muted-foreground">
                                            {appointment.time}
                                        </div>
                                        <div>
                                            <p className="font-medium">{appointment.patient}</p>
                                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                        appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        appointment.status === 'Urgent' ? 'bg-red-100 text-red-800' : ''
                                    }`}>
                                        {appointment.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            <button className="flex items-center gap-3 p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium">View All Patients</p>
                                    <p className="text-sm text-muted-foreground">Manage patient records</p>
                                </div>
                            </button>
                            <button className="flex items-center gap-3 p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                                <CalendarCheck className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium">Schedule Appointment</p>
                                    <p className="text-sm text-muted-foreground">Book new appointment</p>
                                </div>
                            </button>
                            <button className="flex items-center gap-3 p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                                <FileText className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="font-medium">Write Prescription</p>
                                    <p className="text-sm text-muted-foreground">Create new prescription</p>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
    
}