"use client";

import doctorSearchService from "@/actions/search/doctorSearch";
import { DoctorProfileResponse, SearchFilter, } from "@/types/search";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AdvancedSearchTestPage() {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<DoctorProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<SearchFilter>({
    term: "",
  });

  const handleSearch = async () => {
    if (!session?.accessToken) {
      setError("Please log in to search");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clean up empty values
      const cleanFilters: SearchFilter = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => {
          if (value === "" || value === undefined) return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        })
      ) as SearchFilter;

      console.log("Sending search filters:", cleanFilters);

      const response = await doctorSearchService.searchDoctors(
        cleanFilters,
        session.accessToken
      );

      setDoctors(response.data);
      setTotalResults(response.totalElements);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof SearchFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      term: "",
    });
    setDoctors([]);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Advanced Doctor Search</h1>

      {/* Search Filters Panel */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Search Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Term */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Term
            </label>
            <input
              type="text"
              value={filters.term || ""}
              onChange={(e) => handleFilterChange("term", e.target.value)}
              placeholder="Search by name, specialty, service..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">2-100 characters</p>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              value={
                filters.isAvailable === undefined
                  ? ""
                  : filters.isAvailable.toString()
              }
              onChange={(e) =>
                handleFilterChange(
                  "isAvailable",
                  e.target.value === "" ? undefined : e.target.value === "true"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </div>

          {/* Min Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Experience (years)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minYearsOfExperience || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minYearsOfExperience",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Experience (years)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.maxYearsOfExperience || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxYearsOfExperience",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="100"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minPrice || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="1000.00"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={filters.country || ""}
              onChange={(e) => handleFilterChange("country", e.target.value)}
              placeholder="e.g., Vietnam"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location/City
            </label>
            <input
              type="text"
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              placeholder="e.g., Ho Chi Minh City"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Languages (comma separated)
            </label>
            <input
              type="text"
              value={filters.languages?.join(", ") || ""}
              onChange={(e) =>
                handleFilterChange(
                  "languages",
                  e.target.value
                    ? e.target.value.split(",").map((l) => l.trim())
                    : undefined
                )
              }
              placeholder="e.g., English, Vietnamese"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Results Summary */}
      {!loading && doctors.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="font-medium">
            Found {totalResults} doctor{totalResults !== 1 ? "s" : ""} | Page{" "}
            {currentPage + 1} of {totalPages}
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && doctors.length > 0 && (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.doctorProfileId}
              className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {doctor.avatar ? (
                  <img
                    src={doctor.avatar}
                    alt={doctor.fullName || "Doctor"}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xl text-gray-600">
                      {doctor.fullName?.charAt(0) || "D"}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {doctor.fullName || "Unknown Doctor"}
                  </h3>
                  <p className="text-gray-600">{doctor.email || "No email"}</p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        doctor.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {doctor.isAvailable ? "Available" : "Not Available"}
                    </span>

                    {doctor.yearsOfExperience && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {doctor.yearsOfExperience} years exp.
                      </span>
                    )}

                    {doctor.specialties &&
                      doctor.specialties.length > 0 &&
                      doctor.specialties.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty.relationshipId}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                        >
                          {specialty.specialtyName}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && doctors.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No doctors found. Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              setFilters((prev) => ({ ...prev, page: currentPage - 1 }));
              handleSearch();
            }}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            onClick={() => {
              setFilters((prev) => ({ ...prev, page: currentPage + 1 }));
              handleSearch();
            }}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}