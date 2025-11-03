"use client"

import * as React from "react"
import { Search, MapPin, Calendar as CalendarIcon, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AppointmentSearchBarProps {
  onSearch?: (params: SearchParams) => void
  className?: string
}

export interface SearchParams {
  query: string
  location: string
  date: Date | undefined
}

const locations = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Boston, MA",
  "Seattle, WA",
  "Denver, CO",
]

export const AppointmentSearchBar = ({
  onSearch,
  className
}: AppointmentSearchBarProps) => {
  const [query, setQuery] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [date, setDate] = React.useState<Date>()

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ query, location, date })
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div
      className={cn(
        "w-full rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-1.5 shadow-md backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {/* Search Input */}
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
          <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <Input
            placeholder="Search for Doctors, Hospitals"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
            className="border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Location Select */}
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="border-0 bg-transparent p-0 text-sm text-gray-900 focus:ring-0 focus:ring-offset-0 [&>span]:text-gray-400">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm transition-colors hover:bg-gray-50">
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span
                className={cn(
                  "text-sm",
                  date ? "text-gray-900" : "text-gray-400"
                )}
              >
                {date ? formatDate(date) : "Date"}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-600 p-0 shadow-md hover:bg-blue-700"
        >
          <Search className="h-4 w-4 text-white" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </div>
  )
}