# Vietnamese Đồng (VND) Pricing Update

## Summary
Updated the pricing filter and display to use Vietnamese đồng (VND) instead of USD, matching the target Vietnamese user base.

## Changes Made

### 1. Price Range Slider
- **Range**: Changed from $0 - $5,695 to 0₫ - 10,000,000₫
- **Step Size**: Changed from 50 to 100,000 (100K VND increments)
- **Formatting**: Using `toLocaleString('vi-VN')` with ₫ symbol

### 2. Updated Files

#### `FilterSidebar.tsx`
```tsx
<PriceRangeSlider
  min={0}
  max={10000000}  // 10 million VND
  value={[filters.minPrice || 0, filters.maxPrice || 10000000]}
  formatValue={(val) => `${val.toLocaleString('vi-VN')}₫`}
/>
```

#### `PriceRangeSlider.tsx`
```tsx
// Default props
min = 0
max = 10000000
step = 100000  // 100K VND steps
formatValue = (val) => `${val.toLocaleString('vi-VN')}₫`
```

#### `DoctorCard.tsx`
```tsx
// Price display
{averagePrice.toLocaleString('vi-VN')}₫
```

## VND Formatting Examples

With `toLocaleString('vi-VN')`:

| Value | Formatted Display |
|-------|-------------------|
| 0 | 0₫ |
| 1000000 | 1.000.000₫ |
| 5500000 | 5.500.000₫ |
| 7000000 | 7.000.000₫ |
| 10000000 | 10.000.000₫ |

## API Compatibility

The component now correctly handles the Postman test data:

```json
{
  "minPrice": 1000000,
  "maxPrice": 7000000
}
```

This will display as:
- Min label: `1.000.000₫`
- Max label: `7.000.000₫`
- Range text: `Range: 1.000.000₫ - 7.000.000₫`

## Visual Result

```
Pricing Filter:

   1.000.000₫           7.000.000₫
      ●━━━━━━━━━━━━━━━━━━━●─────
   ▏                              ▕
   0                       10.000.000

  Range: 1.000.000₫ - 7.000.000₫
```

## Notes

- Uses Vietnamese locale formatting (`.` as thousands separator)
- Currency symbol `₫` placed after the number (Vietnamese convention)
- Step size of 100,000₫ provides appropriate granularity for medical consultation pricing
- All price displays are consistent throughout the search page

## Testing

To test with your Postman data:

1. Navigate to `/search`
2. Open Pricing filter
3. Set min to 1,000,000₫ and max to 7,000,000₫
4. Click "Apply Filters"
5. API request will send: `{ "minPrice": 1000000, "maxPrice": 7000000 }`
