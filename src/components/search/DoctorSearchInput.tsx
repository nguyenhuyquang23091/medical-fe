"use client";

import doctorSearchService from "@/actions/search/doctorSearch";
import { SearchSuggestion, SuggestionType } from "@/types/search";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

interface DoctorSearchInputProps {
  onSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  debounceDelay?: number;
  maxSuggestions?: number;
  className?: string;
}

/**
 * Production-ready search input component with debouncing and request cancellation
 *
 * Features:
 * - Debounced search (default 300ms)
 * - Request cancellation (AbortController)
 * - Keyboard navigation (↑↓ arrows, Enter, Escape)
 * - Race condition prevention
 * - Memory leak prevention
 * - Accessibility support
 *
 * @example
 * <DoctorSearchInput
 *   onSelect={(suggestion) => console.log(suggestion)}
 *   placeholder="Search doctors..."
 *   debounceDelay={300}
 *   maxSuggestions={10}
 * />
 */
export const DoctorSearchInput: React.FC<DoctorSearchInputProps> = ({
  onSelect,
  placeholder = "Search for doctors, specialties, services...",
  debounceDelay = 300,
  maxSuggestions = 10,
  className = "",
}) => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch suggestions with request cancellation
   */
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
        maxSuggestions,
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

      setError(
        err instanceof Error ? err.message : "Failed to fetch suggestions"
      );
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input change with debouncing
   */
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedIndex(-1);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Cancel ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, debounceDelay);
  };

  /**
   * Handle keyboard navigation
   */
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

  /**
   * Handle suggestion selection
   */
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    setShowDropdown(false);
    setSelectedIndex(-1);

    if (onSelect) {
      onSelect(suggestion);
    }
  };

  /**
   * Get icon for suggestion type
   */
  const getSuggestionIcon = (type: SuggestionType): string => {
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

  /**
   * Get badge color for suggestion type
   */
  const getSuggestionBadgeColor = (type: SuggestionType): string => {
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

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      // Abort ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          aria-label="Search"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={showDropdown}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          id="suggestions-list"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.entityId}-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSuggestionSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : "hover:bg-gray-50"
              } ${index !== suggestions.length - 1 ? "border-b" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {getSuggestionIcon(suggestion.type)}
                </span>

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
                      <span>{suggestion.matchCount} matches</span>
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
      {showDropdown &&
        !loading &&
        suggestions.length === 0 &&
        searchTerm.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-center text-sm">
              No suggestions found for "{searchTerm}"
            </p>
          </div>
        )}

      {/* Error Display */}
      {error && (
        <div className="absolute z-50 w-full mt-2 bg-red-50 border border-red-300 rounded-lg shadow-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
