"use client";

import { SearchFilter } from "@/types/search";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PriceRangeSlider } from "./PriceRangeSlider";

interface FilterSidebarProps {
  filters: SearchFilter;
  onFilterChangeAction: (filters: Partial<SearchFilter>) => void;
  onClearAllAction: () => void;
  onSearchAction: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChangeAction,
  onClearAllAction,
  onSearchAction,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    specialties: true,
    pricing: true,
    experience: true,
    languages: true,
    ratings: true,
  });

  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Specialty options (sample data - would come from API)
  const specialtyOptions = [
    { id: 1, name: "Urology", count: 21 },
    { id: 2, name: "Psychiatry", count: 18 },
    { id: 3, name: "Cardiology", count: 24 },
    { id: 4, name: "Neurology", count: 16 },
    { id: 5, name: "Orthopedics", count: 20 },
    { id: 6, name: "Pediatrics", count: 22 },
    { id: 7, name: "Dermatology", count: 15 },
    { id: 8, name: "Ophthalmology", count: 12 },
  ];

  const visibleSpecialties = showAllSpecialties
    ? specialtyOptions
    : specialtyOptions.slice(0, 5);

  // Experience tiers
  const experienceTiers = [
    { value: 2, label: "2+ Years" },
    { value: 5, label: "5+ Years" },
    { value: 7, label: "7+ Years" },
    { value: 10, label: "10+ Years" },
  ];

  // Language options
  const languageOptions = [
    "English",
    "French",
    "Spanish",
    "German",
    "Vietnamese",
    "Chinese",
    "Japanese",
    "Korean",
  ];

  const visibleLanguages = showAllLanguages
    ? languageOptions
    : languageOptions.slice(0, 4);

  const handleSpecialtyToggle = (specialtyId: number) => {
    const current = filters.specialtyIds || [];
    const updated = current.includes(specialtyId)
      ? current.filter((id) => id !== specialtyId)
      : [...current, specialtyId];
    onFilterChangeAction({ specialtyIds: updated.length > 0 ? updated : undefined });
  };

  const handleLanguageToggle = (language: string) => {
    const current = filters.languages || [];
    const updated = current.includes(language)
      ? current.filter((l) => l !== language)
      : [...current, language];
    onFilterChangeAction({ languages: updated.length > 0 ? updated : undefined });
  };

  const handleExperienceChange = (minYears: number) => {
    onFilterChangeAction({
      minYearsOfExperience: filters.minYearsOfExperience === minYears ? undefined : minYears,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg sticky top-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAllAction}
          className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          Clear All
        </Button>
      </div>

      {/* Filter Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Specialties */}
        <div>
          <button
            onClick={() => toggleSection("specialties")}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-3"
          >
            Specialties
            {expandedSections.specialties ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.specialties && (
            <div className="space-y-2">
              {visibleSpecialties.map((specialty) => (
                <div key={specialty.id} className="flex items-center">
                  <Checkbox
                    id={`specialty-${specialty.id}`}
                    checked={filters.specialtyIds?.includes(specialty.id) || false}
                    onCheckedChange={() => handleSpecialtyToggle(specialty.id)}
                  />
                  <label
                    htmlFor={`specialty-${specialty.id}`}
                    className="ml-2 text-sm text-gray-700 flex-1 cursor-pointer"
                  >
                    {specialty.name}
                  </label>
                  <span className="text-xs text-gray-500">({specialty.count})</span>
                </div>
              ))}
              {specialtyOptions.length > 5 && (
                <button
                  onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAllSpecialties ? "View Less" : "View More"}
                </button>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Pricing */}
        <div>
          <button
            onClick={() => toggleSection("pricing")}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-3"
          >
            Pricing
            {expandedSections.pricing ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.pricing && (
            <div className="py-2">
              <PriceRangeSlider
                min={0}
                max={10000000}
                value={[filters.minPrice || 0, filters.maxPrice || 10000000]}
                onChangeAction={(value) => {
                  const priceFilters = {
                    minPrice: value[0] === 0 ? undefined : value[0],
                    maxPrice: value[1] === 10000000 ? undefined : value[1],
                  };
                  onFilterChangeAction(priceFilters);
                }}
                formatValue={(val) => `${val.toLocaleString('vi-VN')}₫`}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Experience */}
        <div>
          <button
            onClick={() => toggleSection("experience")}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-3"
          >
            Experience
            {expandedSections.experience ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.experience && (
            <div className="space-y-2">
              {experienceTiers.map((tier) => (
                <div key={tier.value} className="flex items-center">
                  <Checkbox
                    id={`exp-${tier.value}`}
                    checked={filters.minYearsOfExperience === tier.value}
                    onCheckedChange={() => handleExperienceChange(tier.value)}
                  />
                  <label
                    htmlFor={`exp-${tier.value}`}
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {tier.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Languages */}
        <div>
          <button
            onClick={() => toggleSection("languages")}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-3"
          >
            Languages
            {expandedSections.languages ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.languages && (
            <div className="space-y-2">
              {visibleLanguages.map((language) => (
                <div key={language} className="flex items-center">
                  <Checkbox
                    id={`lang-${language}`}
                    checked={filters.languages?.includes(language) || false}
                    onCheckedChange={() => handleLanguageToggle(language)}
                  />
                  <label
                    htmlFor={`lang-${language}`}
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {language}
                  </label>
                </div>
              ))}
              {languageOptions.length > 4 && (
                <button
                  onClick={() => setShowAllLanguages(!showAllLanguages)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAllLanguages ? "View Less" : "View More"}
                </button>
              )}
            </div>
          )}
        </div>

        <Separator />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button onClick={onSearchAction} className="w-full bg-blue-600 hover:bg-blue-700">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
