"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import doctorSearchService from "@/actions/search/doctorSearch";
import { SearchSuggestion, SuggestionType } from "@/types/search";

interface SearchBarProps {
  onSearchAction: (searchTerm: string) => void;
  defaultSearchTerm?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchAction,
  defaultSearchTerm = "",
}) => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    onSearchAction(searchTerm);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionSelect(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearchAction(suggestion.text);
  };

  const fetchSuggestions = async (term: string) => {
    if (!term || term.length < 2 || !session?.accessToken) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const response = await doctorSearchService.getSearchSuggestions(
        term,
        8,
        session.accessToken
      );
      setSuggestions(response);
      setShowSuggestions(response.length > 0);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setSelectedIndex(-1);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Debounce suggestions fetch
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };


  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className="w-full shadow-lg rounded-full border-2 border-blue-400 p-2 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/bg_image-removebg.png')",
          backgroundColor: "#ffffff", // Fallback white
        }}
      >
        {/* Optional overlay for better contrast */}
        <div className="absolute inset-0 bg-white/50 rounded-full"></div>

        <div className="flex items-center gap-3 relative z-10">
          {/* Search Term Input */}
          <div className="flex items-center flex-1 gap-3 px-6">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search for Doctors, Hospitals, Specialties..."
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base"
            />
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 rounded-full flex-shrink-0"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown - Google Style */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.entityId}-${index}`}
              onClick={() => handleSuggestionSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">{suggestion.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
