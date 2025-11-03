"use client";

import { DoctorSearchInput } from "@/components/search/DoctorSearchInput";
import { SearchSuggestion } from "@/types/search";
import { useState } from "react";

/**
 * Enhanced search test page demonstrating production-ready implementation
 * with debouncing and request cancellation
 */
export default function SearchEnhancedTestPage() {
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<SearchSuggestion | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<SearchSuggestion[]>(
    []
  );

  const handleSelect = (suggestion: SearchSuggestion) => {
    setSelectedSuggestion(suggestion);
    setSelectionHistory((prev) => [suggestion, ...prev].slice(0, 10)); // Keep last 10
  };

  const clearHistory = () => {
    setSelectionHistory([]);
    setSelectedSuggestion(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">
        Enhanced Search Implementation
      </h1>
      <p className="text-gray-600 mb-6">
        Production-ready search with debouncing, request cancellation, and race
        condition prevention
      </p>

      {/* Features List */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold text-blue-900 mb-3 text-lg">
          🚀 Enhanced Features:
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-sm">Debounced Search (300ms)</p>
              <p className="text-xs text-gray-600">
                Reduces API calls by 90%+
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-sm">Request Cancellation</p>
              <p className="text-xs text-gray-600">
                AbortController prevents race conditions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-sm">Keyboard Navigation</p>
              <p className="text-xs text-gray-600">
                Arrow keys, Enter, Escape support
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-sm">Memory Leak Prevention</p>
              <p className="text-xs text-gray-600">
                Proper cleanup on unmount
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-sm">Accessibility</p>
              <p className="text-xs text-gray-600">
                ARIA labels and roles
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-sm">Error Handling</p>
              <p className="text-xs text-gray-600">
                Graceful error recovery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input Component */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for Doctors, Specialties, or Services
        </label>
        <DoctorSearchInput
          onSelect={handleSelect}
          placeholder="Try typing 'cardiology', 'dentist', or a location..."
          debounceDelay={300}
          maxSuggestions={10}
        />
      </div>

      {/* Performance Comparison */}
      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded">
        <h3 className="font-semibold mb-3">📊 Performance Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Scenario</th>
                <th className="px-4 py-2 text-center">No Limit</th>
                <th className="px-4 py-2 text-center">Throttle</th>
                <th className="px-4 py-2 text-center bg-green-100">
                  Debounce ✓
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 font-medium">
                  Type "cardiology" (10 chars)
                </td>
                <td className="px-4 py-2 text-center text-red-600">
                  10 calls
                </td>
                <td className="px-4 py-2 text-center text-orange-600">
                  4 calls
                </td>
                <td className="px-4 py-2 text-center text-green-600 bg-green-50 font-bold">
                  1 call
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">100 users typing</td>
                <td className="px-4 py-2 text-center text-red-600">
                  1,000+ calls
                </td>
                <td className="px-4 py-2 text-center text-orange-600">
                  400 calls
                </td>
                <td className="px-4 py-2 text-center text-green-600 bg-green-50 font-bold">
                  100 calls
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Server load</td>
                <td className="px-4 py-2 text-center text-red-600">High</td>
                <td className="px-4 py-2 text-center text-orange-600">
                  Medium
                </td>
                <td className="px-4 py-2 text-center text-green-600 bg-green-50 font-bold">
                  Low
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Result quality</td>
                <td className="px-4 py-2 text-center text-red-600">Poor</td>
                <td className="px-4 py-2 text-center text-orange-600">
                  Mixed
                </td>
                <td className="px-4 py-2 text-center text-green-600 bg-green-50 font-bold">
                  Excellent
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          * Debounce reduces API calls by 75-90% compared to throttle
        </p>
      </div>

      {/* Selected Suggestion Display */}
      {selectedSuggestion && (
        <div className="mb-8 p-4 bg-green-50 border border-green-300 rounded">
          <h3 className="font-semibold text-green-900 mb-2">
            ✓ Selected Suggestion
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Text:</span>{" "}
              {selectedSuggestion.text}
            </div>
            <div>
              <span className="font-medium">Type:</span>{" "}
              {selectedSuggestion.type}
            </div>
            <div>
              <span className="font-medium">Entity ID:</span>{" "}
              {selectedSuggestion.entityId}
            </div>
            <div>
              <span className="font-medium">Score:</span>{" "}
              {selectedSuggestion.score.toFixed(2)}
            </div>
            {selectedSuggestion.matchCount > 0 && (
              <div>
                <span className="font-medium">Matches:</span>{" "}
                {selectedSuggestion.matchCount}
              </div>
            )}
            {selectedSuggestion.description && (
              <div className="md:col-span-2">
                <span className="font-medium">Description:</span>{" "}
                {selectedSuggestion.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selection History */}
      {selectionHistory.length > 0 && (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">📝 Selection History</h3>
            <button
              onClick={clearHistory}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {selectionHistory.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{suggestion.text}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                    {suggestion.type}
                  </span>
                </div>
                <span className="text-gray-500 text-xs">
                  Score: {suggestion.score.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">
          🔧 Technical Implementation
        </h3>
        <div className="text-sm space-y-2 text-blue-800">
          <div>
            <span className="font-medium">Component:</span>{" "}
            <code className="bg-blue-100 px-2 py-0.5 rounded">
              src/components/search/DoctorSearchInput.tsx
            </code>
          </div>
          <div>
            <span className="font-medium">Hook:</span>{" "}
            <code className="bg-blue-100 px-2 py-0.5 rounded">
              src/hooks/useDebounce.ts
            </code>
          </div>
          <div>
            <span className="font-medium">API Action:</span>{" "}
            <code className="bg-blue-100 px-2 py-0.5 rounded">
              src/actions/search/doctorSearch.ts
            </code>
          </div>
          <div>
            <span className="font-medium">Debounce Delay:</span> 300ms (optimal)
          </div>
          <div>
            <span className="font-medium">Request Cancellation:</span>{" "}
            AbortController
          </div>
          <div>
            <span className="font-medium">Documentation:</span>{" "}
            <code className="bg-blue-100 px-2 py-0.5 rounded">
              DEBOUNCE_VS_THROTTLE.md
            </code>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-900 mb-2">💡 Try This</h3>
        <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
          <li>
            Type quickly and notice the search only triggers after you pause
          </li>
          <li>
            Type "cardio", then immediately clear and type "neuro" - previous
            request is cancelled
          </li>
          <li>Use ↑↓ arrow keys to navigate suggestions</li>
          <li>Press Enter to select a highlighted suggestion</li>
          <li>Press Escape to close the dropdown</li>
          <li>Open browser DevTools Network tab to see request optimization</li>
        </ul>
      </div>
    </div>
  );
}
