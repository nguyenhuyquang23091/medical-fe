# Main Search Bar Implementation

## Summary
Added a prominent central search bar at the top of the Doctor List page, matching the reference design. Removed the redundant search term input from the filter sidebar.

## Changes Made

### 1. New Component: SearchBar.tsx

**Location**: `src/components/search/SearchBar.tsx`

**Features**:
- Search term input (doctors, hospitals, specialties)
- Location selector
- Date picker with calendar
- Prominent blue Search button
- Rounded pill design with blue border
- Enter key support for quick search

**Design**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search for Doctors... | 📍 Location | 📅 Date | [Search] │
└─────────────────────────────────────────────────────────────┘
```

### 2. Updated FilterSidebar.tsx

**Removed**: Search Term input field from the filter sidebar

**Before**:
```tsx
{/* Search Term */}
<Input placeholder="Doctor, specialty, service..." />
<Separator />
{/* Specialties */}
```

**After**:
```tsx
{/* Specialties */}
// Search term input removed
```

### 3. Updated Search Page Layout

**Added**:
- Hero section with gradient background (blue to cyan)
- "Doctor List" title centered
- Subtitle text
- Centered search bar (max-width: 5xl)
- "Showing X Doctors For You" header below hero

**Layout Structure**:
```
┌──────────────────────────────────────────┐
│    Hero Section (Blue Gradient)         │
│                                          │
│         Doctor List                      │
│    Find the best doctors...              │
│                                          │
│   [Search Bar Component]                 │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  Showing 450 Doctors For You            │
└──────────────────────────────────────────┘
┌────────┬─────────────────────────────────┐
│ Filter │     Results                     │
│ Side   │     [Doctor Cards]              │
│ bar    │                                 │
└────────┴─────────────────────────────────┘
```

## Component API

### SearchBar Props

```tsx
interface SearchBarProps {
  onSearchAction: (params: {
    searchTerm: string;
    location: string;
    date?: Date;
  }) => void;
  defaultSearchTerm?: string;
  defaultLocation?: string;
}
```

### Usage Example

```tsx
import { SearchBar } from "@/components/search/SearchBar";

<SearchBar
  onSearchAction={(params) => {
    console.log(params.searchTerm);  // "Cardiology"
    console.log(params.location);     // "Ho Chi Minh City"
    console.log(params.date);         // Date object
  }}
  defaultSearchTerm="Cardiology"
  defaultLocation="Ho Chi Minh City"
/>
```

## Visual Design Details

### Hero Section
- **Background**: Gradient from `blue-500` to `cyan-400`
- **Padding**: `py-16` (64px vertical)
- **Title**: 4xl/5xl font, bold, white color
- **Subtitle**: Blue-50 color, large text

### Search Bar
- **Container**: White background, rounded-full
- **Border**: 2px blue-400 border
- **Shadow**: Large shadow (shadow-lg)
- **Layout**: Flexbox with 3 inputs + 1 button

### Search Button
- **Color**: Blue-500 background
- **Hover**: Blue-600
- **Shape**: Rounded-full (pill shape)
- **Padding**: px-8 py-6
- **Icon**: Search icon + "Search" text

## Integration with Filters

The SearchBar integrates with the existing filter system:

1. **Search Term** → Updates `filters.term`
2. **Location** → Updates `filters.location`
3. **Date** → Reserved for future Elasticsearch integration

**Handler**:
```tsx
const handleMainSearch = (params) => {
  setFilters((prev) => ({
    ...prev,
    term: params.searchTerm,
    location: params.location,
  }));
  setTimeout(() => handleSearch(), 100);
};
```

## Elasticsearch Ready

The SearchBar is structured to support future Elasticsearch integration:

### Planned Fields:
- `searchTerm`: Full-text search across doctor names, specialties, services
- `location`: Geo-based search and filtering
- `date`: Availability filtering by appointment date

### Search Query Structure:
```json
{
  "query": {
    "bool": {
      "must": [
        { "multi_match": { "query": "Cardiology", "fields": ["name", "specialty"] }},
        { "match": { "location": "Ho Chi Minh City" }}
      ],
      "filter": [
        { "range": { "available_dates": { "gte": "2025-11-03" }}}
      ]
    }
  }
}
```

## Components Used

### ShadCN UI Components:
- `Button` - Search button
- `Input` - Text inputs
- `Calendar` - Date picker
- `Popover` - Calendar dropdown
- `PopoverContent` / `PopoverTrigger` - Popover parts

### Lucide Icons:
- `Search` - Search icons
- `MapPin` - Location icon
- `CalendarIcon` - Date icon

## Responsive Behavior

### Desktop (1024px+):
- Full-width search bar
- All inputs visible inline
- 5xl max-width container

### Tablet (768px - 1023px):
- Slightly reduced padding
- Inputs may wrap to 2 rows

### Mobile (< 768px):
- Search inputs stack vertically (future enhancement)
- Search button full-width
- Hero text size reduced

## Keyboard Shortcuts

- **Enter Key**: Triggers search from any input field
- **Tab**: Navigate between inputs
- **Esc**: Close date picker

## Accessibility

- All inputs have proper placeholders
- Icons have descriptive visual context
- Calendar has keyboard navigation
- Focus states on all interactive elements
- Screen reader friendly structure

## Comparison: Before vs After

### Before:
- ❌ No central search bar
- ❌ Search term buried in filter sidebar
- ❌ No location or date inputs
- ❌ No prominent CTA
- ❌ Plain layout

### After:
- ✅ Prominent central search bar
- ✅ Search term in hero section
- ✅ Location and date pickers
- ✅ Large blue Search button
- ✅ Beautiful gradient hero section
- ✅ Matches reference design exactly

## Future Enhancements

1. **Autocomplete**: Add suggestions as user types
2. **Recent Searches**: Show recent search history
3. **Location Autocomplete**: Integrate with maps API
4. **Advanced Filters**: Quick filter chips below search bar
5. **Voice Search**: Add microphone icon for voice input
6. **Search Analytics**: Track popular searches

## Testing

To test the SearchBar:

1. Navigate to `/search`
2. Enter search term: "Cardiology"
3. Enter location: "Ho Chi Minh City"
4. Select a date from calendar
5. Click Search button
6. Verify filters are applied
7. Check results update correctly

## Notes

- Date parameter currently not sent to API (reserved for future)
- Enter key works in all input fields
- Search bar state syncs with filter state
- Removed redundant search input from sidebar
- Clean, centered design matching reference
