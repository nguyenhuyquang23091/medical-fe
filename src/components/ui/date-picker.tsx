"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date) => void
  label: string
  placeholder?: string
  id?: string
  fromYear?: number
  toYear?: number
  disabled?: boolean
}

export function DatePicker({
  selected,
  onSelect,
  label = "Subscription Date",
  placeholder = "June 01, 2025",
  id = "date",
  fromYear,
  toYear,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(selected || new Date())
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(selected ? formatDate(selected) : "")

  // Update internal state when selected prop changes
  React.useEffect(() => {
    if (selected) {
      setDate(selected)
      setMonth(selected)
      setValue(formatDate(selected))
    }
  }, [selected])

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setValue(formatDate(newDate))
      setMonth(newDate)
      if (onSelect) {
        onSelect(newDate)
      }
    }
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id} className="px-1">
        {label}
      </Label>
      <div className="relative flex gap-2">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          className="bg-background pr-10"
          disabled={disabled}
          onChange={(e) => {
            setValue(e.target.value)
            const newDate = new Date(e.target.value)
            if (isValidDate(newDate)) {
              setDate(newDate)
              setMonth(newDate)
              if (onSelect) {
                onSelect(newDate)
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${id}-picker`}
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              disabled={disabled}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              fromYear={fromYear}
              toYear={toYear}
              onMonthChange={setMonth}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
