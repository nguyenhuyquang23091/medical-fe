"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import doctorSearchService from "@/actions/search/doctorSearch";
import { DoctorProfileResponse, SearchFilter } from "@/types/search";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SearchHeader } from "@/components/search/SearchHeader";
import { DoctorCard } from "@/components/search/DoctorCard";
import { SearchPagination } from "@/components/search/SearchPagination";
import { MobileFilterSheet } from "@/components/search/MobileFilterSheet";
import { SearchBar } from "@/components/search/SearchBar";

export default function SearchPage() {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<DoctorProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("relevance");

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
        Object.entries(filters).filter(([, value]) => {
          if (value === "" || value === undefined) return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        })
      ) as SearchFilter;

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

  const handleFilterChange = (newFilters: Partial<SearchFilter>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleClearFilters = () => {
    setFilters({ term: "" });
    setDoctors([]);
    setError(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    handleSearch();
  };

  const handleMainSearch = (searchTerm: string) => {
    setFilters((prev) => ({
      ...prev,
      term: searchTerm,
    }));
    // Trigger search after state update
    setTimeout(() => handleSearch(), 100);
  };

  // Load all doctors on initial page load
  useEffect(() => {
    const loadInitialDoctors = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const response = await doctorSearchService.searchAllDoctors(
          1, // page (1-based pagination)
          10, // size
          session.accessToken
        );
        setDoctors(response.data);
        setTotalResults(response.totalElements);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error("Error loading initial doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialDoctors();
  }, [session?.accessToken]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Hero Section with Search Bar */}
      <div
        className="relative py-16 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/bg_image-removebg.png')",
          backgroundColor: '#f0f9ff', // Fallback light blue
        }}
      >
        {/* Optional overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/80 to-blue-50/80"></div>

        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-2">
            Doctor List
          </h1>
          <p className="text-gray-600 text-center mb-8 text-lg">
            Find the best doctors for your healthcare needs
          </p>
          <div className="max-w-4xl mx-auto">
            <SearchBar
              onSearchAction={handleMainSearch}
              defaultSearchTerm={filters.term}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Results Summary Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Showing{" "}
            <span className="text-blue-600">{totalResults}</span>{" "}
            Doctors For You
          </h2>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChangeAction={handleFilterChange}
              onClearAllAction={handleClearFilters}
              onSearchAction={handleSearch}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="mb-4 lg:hidden">
              <MobileFilterSheet
                filters={filters}
                onFilterChangeAction={handleFilterChange}
                onClearAllAction={handleClearFilters}
                onSearchAction={handleSearch}
              />
            </div>

            {/* Search Header */}
            <SearchHeader
              totalResults={totalResults}
              viewMode={viewMode}
              sortBy={sortBy}
              onViewModeChangeAction={setViewMode}
              onSortChangeAction={setSortBy}
              currentPage={currentPage}
              totalPages={totalPages}
            />

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {!loading && doctors.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4"
                    : "space-y-4"
                }
              >
                {doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.doctorProfileId}
                    doctor={doctor}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && doctors.length === 0 && !error && (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No doctors found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-6">
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChangeAction={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
