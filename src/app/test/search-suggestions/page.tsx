"use client";

import doctorSearchService from "@/actions/search/doctorSearch";
import { SearchSuggestion, SuggestionType } from "@/types/search";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function SearchSuggestionsTestPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [limit, setLimit] = useState(10);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch suggestions with debouncing and request cancellation
  const fetchSuggestions = async (term: string) => {
    if (!term || term.length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (!session?.accessToken) {
      setError("Please log in to use search");
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await doctorSearchService.getSearchSuggestions(
        term,
        limit,
        session.accessToken,
        abortControllerRef.current.signal
      );
      setSuggestions(response);
      setShowDropdown(true);
    } catch (err) {
      // Ignore AbortError as it's expected when requests are cancelled
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to fetch suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedIndex(-1);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: SuggestionType) => {
    switch (type) {
      case SuggestionType.DOCTOR:
        return "👨‍⚕️";
      case SuggestionType.SPECIALTY:
        return "🏥";
      case SuggestionType.SERVICE:
        return "💊";
      case SuggestionType.HOSPITAL:
        return "🏢";
      case SuggestionType.LOCATION:
        return "📍";
      default:
        return "🔍";
    }
  };

  // Get badge color for suggestion type
  const getSuggestionBadgeColor = (type: SuggestionType) => {
    switch (type) {
      case SuggestionType.DOCTOR:
        return "bg-blue-100 text-blue-800";
      case SuggestionType.SPECIALTY:
        return "bg-purple-100 text-purple-800";
      case SuggestionType.SERVICE:
        return "bg-green-100 text-green-800";
      case SuggestionType.HOSPITAL:
        return "bg-orange-100 text-orange-800";
      case SuggestionType.LOCATION:
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Cleanup timeout and abort controller on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        Test: Search Suggestions (Real-time)
      </h1>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-semibold text-blue-900 mb-2">Instructions:</h2>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Start typing in the search box to see real-time suggestions</li>
          <li>Use ↑ and ↓ arrow keys to navigate suggestions</li>
          <li>Press Enter to select a suggestion</li>
          <li>Press Escape to close the dropdown</li>
          <li>Suggestions are debounced (300ms delay)</li>
        </ul>
      </div>

      {/* Limit Selector */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="limit" className="font-medium">
          Max suggestions:
        </label>
        <select
          id="limit"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Search Input with Dropdown */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search for doctors, specialties, services..."
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.entityId}-${index}`}
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : "hover:bg-gray-50"
                } ${index !== suggestions.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getSuggestionIcon(suggestion.type)}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {suggestion.text}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getSuggestionBadgeColor(
                          suggestion.type
                        )}`}
                      >
                        {suggestion.type}
                      </span>
                    </div>

                    {suggestion.description && (
                      <p className="text-sm text-gray-600 mb-1">
                        {suggestion.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {suggestion.matchCount > 0 && (
                        <span>Matches: {suggestion.matchCount}</span>
                      )}
                      {suggestion.score && (
                        <span>Score: {suggestion.score.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No suggestions message */}
        {showDropdown && !loading && suggestions.length === 0 && searchTerm.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-center">No suggestions found</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Current State Display */}
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-semibold mb-2">Current State:</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Search Term:</span>{" "}
              {searchTerm || "(empty)"}
            </p>
            <p>
              <span className="font-medium">Suggestions Count:</span>{" "}
              {suggestions.length}
            </p>
            <p>
              <span className="font-medium">Selected Index:</span>{" "}
              {selectedIndex >= 0 ? selectedIndex : "None"}
            </p>
            <p>
              <span className="font-medium">Dropdown Visible:</span>{" "}
              {showDropdown ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Loading:</span>{" "}
              {loading ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Current Suggestions Summary */}
        {suggestions.length > 0 && (
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-semibold mb-2">
              Suggestions Summary ({suggestions.length} total):
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.values(SuggestionType).map((type) => {
                const count = suggestions.filter((s) => s.type === type).length;
                return count > 0 ? (
                  <div
                    key={type}
                    className={`px-3 py-2 rounded text-center ${getSuggestionBadgeColor(
                      type
                    )}`}
                  >
                    <div className="text-lg">{getSuggestionIcon(type)}</div>
                    <div className="text-xs font-medium">{type}</div>
                    <div className="text-sm font-bold">{count}</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
