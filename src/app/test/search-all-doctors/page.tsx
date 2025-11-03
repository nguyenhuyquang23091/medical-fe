"use client";

import doctorSearchService from "@/actions/search/doctorSearch";
import { DoctorProfileResponse, PageResponse } from "@/types/search";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SearchAllDoctorsTestPage() {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<DoctorProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInfo, setPageInfo] = useState<Omit<
    PageResponse<DoctorProfileResponse>,
    "data"
  > | null>(null);

  const fetchDoctors = async () => {
    if (!session?.accessToken) {
      setError("Please log in to search doctors");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await doctorSearchService.searchAllDoctors(
        page,
        pageSize,
        session.accessToken
      );

      setDoctors(response.data);
      setPageInfo({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchDoctors();
    }
  }, [page, pageSize, session?.accessToken]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (pageInfo && page < pageInfo.totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Test: Search All Doctors
      </h1>

      {/* Page Size Selector */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="pageSize" className="font-medium">
          Results per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1); // Reset to first page
          }}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <button
          onClick={fetchDoctors}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Pagination Info */}
      {pageInfo && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-sm font-medium">
            Page {pageInfo.currentPage} of {pageInfo.totalPages} | Total
            Doctors: {pageInfo.totalElements}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      )}

      {/* Doctors List */}
      {!loading && doctors.length > 0 && (
        <div className="space-y-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.doctorProfileId}
              className="border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Doctor Header */}
              <div className="flex items-start gap-4 mb-4">
                {doctor.avatar ? (
                  <img
                    src={doctor.avatar}
                    alt={doctor.fullName || "Doctor"}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-2xl text-gray-600">
                      {doctor.fullName?.charAt(0) || "D"}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{doctor.fullName || "Unknown Doctor"}</h2>
                  <p className="text-gray-600">{doctor.email || "No email"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        doctor.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {doctor.isAvailable ? "Available" : "Unavailable"}
                    </span>
                    {doctor.yearsOfExperience && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                        {doctor.yearsOfExperience} years experience
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {doctor.bio && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Bio:</h3>
                  <p className="text-gray-700">{doctor.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {doctor.specialties && doctor.specialties.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Specialties:</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.map((specialty) => (
                      <span
                        key={specialty.relationshipId}
                        className={`px-3 py-1 rounded-full text-sm ${
                          specialty.isPrimary
                            ? "bg-purple-600 text-white"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {specialty.specialtyName}
                        {specialty.isPrimary && " ⭐"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {doctor.services && doctor.services.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Services:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {doctor.services.map((service) => (
                      <div
                        key={service.relationshipId}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded"
                      >
                        <span>{service.serviceName}</span>
                        <span className="font-semibold text-green-700">
                          {service.price} {service.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Languages:</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experiences */}
              {doctor.experiences && doctor.experiences.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Experience:</h3>
                  <div className="space-y-2">
                    {doctor.experiences.map((exp) => (
                      <div
                        key={exp.relationshipId}
                        className="bg-gray-50 p-3 rounded"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{exp.position}</p>
                            <p className="text-gray-700">
                              {exp.hospitalName} - {exp.department}
                            </p>
                            <p className="text-sm text-gray-600">
                              {exp.location}, {exp.country}
                            </p>
                            <p className="text-sm text-gray-500">
                              {exp.startDate} -{" "}
                              {exp.isCurrent ? "Present" : exp.endDate}
                            </p>
                          </div>
                          {exp.isHighlighted && (
                            <span className="text-yellow-500 text-xl">⭐</span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && doctors.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-600">No doctors found</p>
        </div>
      )}

      {/* Pagination Controls */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Previous
          </button>

          <span className="font-medium">
            Page {page} of {pageInfo.totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={page === pageInfo.totalPages || loading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
