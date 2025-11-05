"use client";

import { DoctorProfileResponse } from "@/types/doctorProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";

interface DoctorInfoHeaderProps {
  doctor: DoctorProfileResponse;
}

export const DoctorInfoHeader: React.FC<DoctorInfoHeaderProps> = ({
  doctor,
}) => {
  const primarySpecialty = doctor.specialties?.find((s) => s.isPrimary);

  return (
    <Card className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-4">
        {/* Doctor Avatar */}
        <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-gray-100">
          <AvatarImage
            src={doctor.avatar || undefined}
            alt={`${doctor.firstName} ${doctor.lastName}` || "Doctor"}
          />
          <AvatarFallback className="text-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            {doctor.firstName?.charAt(0) || "D"}
          </AvatarFallback>
        </Avatar>

        {/* Doctor Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              Dr. {doctor.firstName || "Unknown"} {doctor.lastName || "Doctor"}
            </h3>
            {/* Rating Badge */}
            <Badge
              variant="outline"
              className="bg-orange-500 text-white border-orange-500"
            >
              <Star className="w-3 h-3 fill-white mr-1" />
              5.0
            </Badge>
          </div>

          {/* Specialty */}
          {primarySpecialty?.specialty?.name ? (
            <p className="text-sm text-gray-600 mb-2">
              {primarySpecialty.specialty.name}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mb-2 italic">
              Specialty information not available
            </p>
          )}

          {/* Location */}
          {doctor.residency ? (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{doctor.residency}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-gray-500 italic">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>Location not specified</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
