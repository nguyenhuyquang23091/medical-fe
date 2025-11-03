"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "./FilterSidebar";
import { SearchFilter } from "@/types/search";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface MobileFilterSheetProps {
  filters: SearchFilter;
  onFilterChangeAction: (filters: Partial<SearchFilter>) => void;
  onClearAllAction: () => void;
  onSearchAction: () => void;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  filters,
  onFilterChangeAction,
  onClearAllAction,
  onSearchAction,
}) => {
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    onSearchAction();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-96 p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Filter Doctors</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-80px)]">
          <FilterSidebar
            filters={filters}
            onFilterChangeAction={onFilterChangeAction}
            onClearAllAction={onClearAllAction}
            onSearchAction={handleSearch}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
