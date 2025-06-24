"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, Save, X, User, Calendar, MapPin, Mail, Phone } from "lucide-react"

interface ProfileData {
  firstName: string
  lastName: string
  dob: string
  city: string
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "Sarah",
    lastName: "Johnson",
    dob: "1985-03-15",
    city: "San Francisco",
  })
  const [editData, setEditData] = useState<ProfileData>(profileData)

  const handleEdit = () => {
    setEditData(profileData)
    setIsEditing(true)
  }

  const handleSave = () => {
    setProfileData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Profile</h1>
          <p className="text-gray-600">Manage your personal information and medical details</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
                  <AvatarFallback className="bg-blue-500 text-white text-xl font-semibold">
                    {getInitials(profileData.firstName, profileData.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {profileData.firstName} {profileData.lastName}
                  </CardTitle>
                  <CardDescription className="text-blue-100 mt-1">Patient ID: #PAT-2024-001</CardDescription>
                 
                </div>
              </div>
              <Button
                onClick={isEditing ? handleCancel : handleEdit}
                variant={isEditing ? "secondary" : "default"}
                className={
                  isEditing ? "bg-white text-blue-600 hover:bg-gray-100" : "bg-blue-500 hover:bg-blue-400 text-white"
                }
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  {isEditing ? "Update your personal details below" : "Your current personal information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          value={editData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          value={editData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dob" className="text-sm font-medium text-gray-700">
                          Date of Birth *
                        </Label>
                        <Input
                          id="dob"
                          type="date"
                          value={editData.dob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                          className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={editData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 sm:flex-none"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">First Name</Label>
                        <p className="mt-1 text-lg font-medium text-gray-900">{profileData.firstName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Name</Label>
                        <p className="mt-1 text-lg font-medium text-gray-900">{profileData.lastName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date of Birth
                        </Label>
                        <p className="mt-1 text-lg font-medium text-gray-900">{formatDate(profileData.dob)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          City
                        </Label>
                        <p className="mt-1 text-lg font-medium text-gray-900">{profileData.city}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg text-gray-900">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">sarah.johnson@email.com</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
