"use client";

import { DoctorProfileResponse } from "@/types/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Globe,
  Award,
} from "lucide-react";
import { useState } from "react";

interface DoctorCardProps {
  doctor: DoctorProfileResponse;
  viewMode?: "grid" | "list";
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Calculate average price from services
  const averagePrice =
    doctor.services && doctor.services.length > 0
      ? doctor.services.reduce((sum, service) => sum + service.price, 0) /
        doctor.services.length
      : 0;

  // Get display specialties
  const displaySpecialties = doctor.specialties?.slice(0, 3) || [];

  // Format rating (using mock data for now)
  const rating = 4.5; // Would come from backend
  const totalVotes = 287; // Would come from backend

  return (
    <Card className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200 relative">
      {/* Availability Badge - Upper Right Corner */}
      <div className="absolute top-4 right-4 z-10">
        {doctor.isAvailable ? (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            ✓ Available
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            ✗ Unavailable
          </Badge>
        )}
      </div>

      <div className="p-6">
        <div className="flex gap-6">
          {/* Doctor Image */}
          <div className="flex-shrink-0">
            <Avatar className="w-28 h-28 border-4 border-gray-100">
              <AvatarImage src={doctor.avatar || undefined} alt={doctor.fullName || "Doctor"} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                {doctor.fullName?.charAt(0) || "D"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            {/* Header with Name and Favorite */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                    Dr. {doctor.fullName || "Unknown"}
                  </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{rating}</span>
                    <span className="text-sm text-gray-500">
                      ({totalVotes} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mb-3">
              {displaySpecialties.map((specialty) => (
                <Badge
                  key={specialty.relationshipId}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {specialty.specialtyName}
                </Badge>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
              {/* Experience */}
              {doctor.yearsOfExperience && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span>{doctor.yearsOfExperience} years experience</span>
                </div>
              )}

              {/* Location */}
              {doctor.residency && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{doctor.residency}</span>
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-medium ml-auto">
                    Get Direction
                  </button>
                </div>
              )}

              {/* Languages */}
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="truncate">
                    {doctor.languages.slice(0, 2).join(", ")}
                    {doctor.languages.length > 2 && ` +${doctor.languages.length - 2}`}
                  </span>
                </div>
              )}

              {/* Price */}
              {averagePrice > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-teal-600">
                    {averagePrice.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-black">per consultation</span>
                </div>
              )}
            </div>

            {/* Services Preview */}
            {doctor.services && doctor.services.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.services.slice(0, 3).map((service) => (
                    <span
                      key={service.relationshipId}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {service.serviceName}
                    </span>
                  ))}
                  {doctor.services.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{doctor.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Footer with Next Available and Book Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Next available: Today, 3:00 PM</span>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
