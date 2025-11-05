import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import {
  SearchFilter,
  SearchSuggestion,
} from "@/types/search";
import { ApiResponse, PageResponse } from "@/types";
import { DoctorProfileResponse } from "@/types/doctorProfile";


const doctorSearchService = {

  searchDoctors: async (
    searchFilter: SearchFilter,
    token: string,
    signal?: AbortSignal
  ): Promise<PageResponse<DoctorProfileResponse>> => {
    try {
      const httpClient = createServerApiClient(token);
      const response = await httpClient.post<
        ApiResponse<PageResponse<DoctorProfileResponse>>
      >(API.SEARCH_DOCTOR, searchFilter, { signal });

      if (!response.data || !response.data.result) {
        throw new Error("Invalid response format");
      }

      return response.data.result;
    } catch (error) {
      // Don't log AbortError as it's expected when requests are cancelled
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.error("Error searching doctors:", error);
      throw error;
    }
  },

  searchAllDoctors: async (
    page: number = 2,
    size: number = 10,
    token: string,
    signal?: AbortSignal
  ): Promise<PageResponse<DoctorProfileResponse>> => {
    try {
      const httpClient = createServerApiClient(token);
      const response = await httpClient.get<
        ApiResponse<PageResponse<DoctorProfileResponse>>
      >(API.SEARCH_ALL_DOCTORS, {
        params: {
          page,
          size,
        },
        signal,
      });

      if (!response.data || !response.data.result) {
        throw new Error("Invalid response format");
      }

      return response.data.result;
    } catch (error) {
      // Don't log AbortError as it's expected when requests are cancelled
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.error("Error fetching all doctors:", error);
      throw error;
    }
  },


  getSearchSuggestions: async (
    term: string,
    limit: number = 10,
    token: string,
    signal?: AbortSignal
  ): Promise<SearchSuggestion[]> => {
    try {
      if (!term || term.length === 0 || term.length > 100) {
        throw new Error("Search term must be between 1 and 100 characters");
      }

      if (limit < 1 || limit > 20) {
        throw new Error("Limit must be between 1 and 20");
      }

      const httpClient = createServerApiClient(token);
      const response = await httpClient.get<ApiResponse<SearchSuggestion[]>>(
        API.SEARCH_SUGGESTIONS,
        {
          params: {
            term,
            limit,
          },
          signal,
        }
      );

      if (!response.data || !response.data.result) {
        throw new Error("Invalid response format");
      }

      return response.data.result;
    } catch (error) {
      // Don't log AbortError as it's expected when requests are cancelled
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.error("Error fetching search suggestions:", error);
      throw error;
    }
  },
};

export default doctorSearchService;
