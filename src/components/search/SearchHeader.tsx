"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid3x3, List, Map } from "lucide-react";

interface SearchHeaderProps {
  totalResults: number;
  viewMode: "grid" | "list";
  sortBy: string;
  onViewModeChangeAction: (mode: "grid" | "list") => void;
  onSortChangeAction: (sort: string) => void;
  currentPage: number;
  totalPages: number;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  totalResults,
  viewMode,
  sortBy,
  onViewModeChangeAction,
  onSortChangeAction,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Results Count */}
        <div className="text-gray-700">
          <span className="font-semibold text-gray-900">{totalResults}</span>{" "}
          <span>
            {totalResults === 1 ? "doctor" : "doctors"} found
          </span>
          {totalPages > 0 && (
            <span className="text-gray-500 ml-2">
              (Page {currentPage + 1} of {totalPages})
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={onSortChangeAction}>
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChangeAction("grid")}
              className={`rounded-none px-3 ${
                viewMode === "grid"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChangeAction("list")}
              className={`rounded-none px-3 ${
                viewMode === "list"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none px-3 text-gray-600 hover:bg-gray-50"
              disabled
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
