"use client"

import React, { useState, useEffect } from "react"
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Calendar,
  Filter,
  SlidersHorizontal,
  Heart,
  Phone,
  Video,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  X,
  Grid3X3,
  List,
  Navigation
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Mock data for doctors - replace with real API data
const mockDoctors = [
  {
    id: "1",
    name: "Dr. Charles Scott",
    specialty: "MBBS, DNB - Neurology",
    specialization: "Neurologist",
    experience: "20 Years of Experience",
    location: "Hamshire, TX",
    rating: 4.8,
    reviewCount: 252,
    totalVotes: 287,
    consultationFee: 600,
    availability: "Available",
    isAvailable: true,
    image: "/images/doctors/doctor-01.jpg",
    isWishlisted: false,
    nextAvailable: "10:00 AM - 15 Oct, Tue",
    languages: ["English", "French"],
    verified: true,
    percentage: 98
  },
  {
    id: "2", 
    name: "Dr. Robert Thomas",
    specialty: "MBBS, MD - Cardiology",
    specialization: "Cardiologist",
    experience: "30 Years of Experience",
    location: "Oakland, CA",
    rating: 4.3,
    reviewCount: 270,
    totalVotes: 300,
    consultationFee: 450,
    availability: "Unavailable",
    isAvailable: false,
    image: "/images/doctors/doctor-02.jpg",
    isWishlisted: false,
    nextAvailable: "11:00 AM - 19 Oct, Sat",
    languages: ["English", "Spanish"],
    verified: true,
    percentage: 92
  },
  {
    id: "3",
    name: "Dr. Sarah Wilson", 
    specialty: "MBBS, MD - General Medicine, DNB - Cardiology",
    specialization: "Cardiologist",
    experience: "15 Years of Experience",
    location: "New York, NY",
    rating: 4.7,
    reviewCount: 189,
    totalVotes: 201,
    consultationFee: 550,
    availability: "Available",
    isAvailable: true,
    image: "/images/doctors/doctor-03.jpg",
    isWishlisted: false,
    nextAvailable: "02:00 PM Today",
    languages: ["English"],
    verified: true,
    percentage: 94
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    specialty: "MBBS, MS - Urology",
    specialization: "Urology",
    experience: "18 Years of Experience", 
    location: "Boston, MA",
    rating: 4.6,
    reviewCount: 145,
    totalVotes: 167,
    consultationFee: 400,
    availability: "Available",
    isAvailable: true,
    image: "/images/doctors/doctor-04.jpg",
    isWishlisted: true,
    nextAvailable: "09:30 AM Tomorrow",
    languages: ["English", "Spanish"],
    verified: true,
    percentage: 87
  }
]

const specializations = [
  { name: "Urology", count: 21 },
  { name: "Psychiatry", count: 21 },
  { name: "Cardiology", count: 21 },
  { name: "Pediatrics", count: 21 },
  { name: "Neurology", count: 21 },
  { name: "Pulmonology", count: 21 }
]

const genderOptions = [
  { name: "Male", count: 21 },
  { name: "Female", count: 21 }
]

interface DoctorCardProps {
  doctor: typeof mockDoctors[0]
  onWishlistToggle: (doctorId: string) => void
  onBookAppointment: (doctorId: string) => void
}

const DoctorCard = ({ doctor, onWishlistToggle, onBookAppointment }: DoctorCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex">
          {/* Doctor Image */}
          <div className="relative w-48 h-48 bg-gray-100 flex-shrink-0">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage src={doctor.image} alt={doctor.name} className="object-cover" />
              <AvatarFallback className="text-2xl font-semibold bg-gray-200 text-gray-600 rounded-none">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            {/* Rating Badge */}
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              {doctor.rating}
            </div>

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute top-3 right-3 h-8 w-8 rounded-full p-0 bg-white/80 hover:bg-white",
                doctor.isWishlisted ? "text-red-500" : "text-gray-400"
              )}
              onClick={() => onWishlistToggle(doctor.id)}
            >
              <Heart className={cn("h-4 w-4", doctor.isWishlisted && "fill-current")} />
            </Button>
          </div>

          {/* Doctor Info */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {/* Specialization */}
                <div className="text-blue-600 font-medium text-sm mb-2">
                  {doctor.specialization}
                </div>

                {/* Doctor Name */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                  {doctor.verified && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Specialty */}
                <p className="text-gray-600 text-sm mb-3">{doctor.specialty}</p>

                {/* Languages */}
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <span className="w-4 h-4 flex items-center justify-center">🌐</span>
                  <span>{doctor.languages.join(", ")}</span>
                </div>

                {/* Rating and Votes */}
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <span className="w-4 h-4 flex items-center justify-center">👍</span>
                  <span>{doctor.percentage}% ({doctor.reviewCount} / {doctor.totalVotes} Votes)</span>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                  <span className="w-4 h-4 flex items-center justify-center">💼</span>
                  <span>{doctor.experience}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{doctor.location}</span>
                  <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">
                    Get Direction
                  </Button>
                </div>
              </div>

              {/* Availability Status */}
              <div className="text-right">
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  doctor.isAvailable 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    doctor.isAvailable ? "bg-green-500" : "bg-red-500"
                  )}></div>
                  {doctor.availability}
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-end justify-between pt-4 border-t border-gray-100">
              <div className="flex items-end gap-12">
                {/* Consultation Fees */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Consultation Fees</span>
                  <span className="text-orange-600 font-bold text-lg">${doctor.consultationFee}</span>
                </div>

                {/* Next Available */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Next available at</span>
                  <span className="text-gray-900 font-medium text-sm">{doctor.nextAvailable}</span>
                </div>
              </div>

              {/* Book Appointment Button */}
              <Button 
                onClick={() => onBookAppointment(doctor.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [doctors, setDoctors] = useState(mockDoctors)
  const [sortBy, setSortBy] = useState("Price (Low to High)")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showMoreSpecialities, setShowMoreSpecialities] = useState(false)

  const handleWishlistToggle = (doctorId: string) => {
    setDoctors(prev => prev.map(doctor => 
      doctor.id === doctorId 
        ? { ...doctor, isWishlisted: !doctor.isWishlisted }
        : doctor
    ))
  }

  const handleBookAppointment = (doctorId: string) => {
    console.log("Booking appointment with doctor:", doctorId)
  }

  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    if (checked) {
      setSelectedSpecializations(prev => [...prev, specialization])
    } else {
      setSelectedSpecializations(prev => prev.filter(s => s !== specialization))
    }
  }

  const handleGenderChange = (gender: string, checked: boolean) => {
    if (checked) {
      setSelectedGenders(prev => [...prev, gender])
    } else {
      setSelectedGenders(prev => prev.filter(g => g !== gender))
    }
  }

  const clearAllFilters = () => {
    setSelectedSpecializations([])
    setSelectedGenders([])
    setSearchTerm("")
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = selectedSpecializations.length === 0 || 
                                 selectedSpecializations.includes(doctor.specialization)
    const matchesGender = selectedGenders.length === 0 // Add gender matching logic when you have gender data

    return matchesSearch && matchesSpecialization && matchesGender
  })

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case "Price (Low to High)":
        return a.consultationFee - b.consultationFee
      case "Price (High to Low)":
        return b.consultationFee - a.consultationFee
      case "Rating":
        return b.rating - a.rating
      case "Experience":
        return parseInt(b.experience) - parseInt(a.experience)
      default:
        return 0
    }
  })

  return (
    <div className="flex gap-6 mt-6">
      {/* Sidebar Filters */}
      <div className="w-80 flex-shrink-0">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Filter</h2>
              <Button 
                variant="link" 
                className="text-blue-600 p-0 h-auto"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>

            {/* Specialities */}
            <div className="mb-6">
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto font-semibold text-gray-900 hover:bg-transparent"
                onClick={() => setShowMoreSpecialities(!showMoreSpecialities)}
              >
                Specialities
                <ChevronDown className={cn("h-4 w-4 transition-transform", showMoreSpecialities && "rotate-180")} />
              </Button>
              
              <div className="mt-4 space-y-3">
                {specializations.slice(0, showMoreSpecialities ? specializations.length : 6).map((spec) => (
                  <div key={spec.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={spec.name}
                        checked={selectedSpecializations.includes(spec.name)}
                        onCheckedChange={(checked) => handleSpecializationChange(spec.name, checked as boolean)}
                      />
                      <label
                        htmlFor={spec.name}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {spec.name}
                      </label>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {spec.count}
                    </span>
                  </div>
                ))}
                
                {!showMoreSpecialities && specializations.length > 6 && (
                  <Button 
                    variant="link" 
                    className="text-blue-600 p-0 h-auto text-sm"
                    onClick={() => setShowMoreSpecialities(true)}
                  >
                    View More
                  </Button>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="mb-6">
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto font-semibold text-gray-900 hover:bg-transparent mb-4"
              >
                Gender
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <div className="space-y-3">
                {genderOptions.map((gender) => (
                  <div key={gender.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={gender.name}
                        checked={selectedGenders.includes(gender.name)}
                        onCheckedChange={(checked) => handleGenderChange(gender.name, checked as boolean)}
                      />
                      <label
                        htmlFor={gender.name}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {gender.name}
                      </label>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {gender.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Showing <span className="text-blue-600">{sortedDoctors.length}</span> Doctors For You
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Availability Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Availability</span>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort By</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Price (Low to High)">Price (Low to High)</SelectItem>
                  <SelectItem value="Price (High to Low)">Price (High to Low)</SelectItem>
                  <SelectItem value="Rating">Rating</SelectItem>
                  <SelectItem value="Experience">Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="p-2"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="p-2"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Map and Location Icons */}
            <Button variant="outline" size="sm" className="p-2">
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="space-y-4">
          {sortedDoctors.length > 0 ? (
            sortedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onWishlistToggle={handleWishlistToggle}
                onBookAppointment={handleBookAppointment}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters to find more results.
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
