import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { ApiResponse } from "@/types";
import { AppointmentRequest, AppointmentResponse } from "@/types/appointment";

/**
 * Appointment service for managing appointment lifecycle
 * Maps to BE AppointmentController endpoints
 */
const appointmentService = {
  /**
   * Create new appointment
   * POST /appointment/create
   *
   * @param request - AppointmentRequest with booking details
   * @param token - User authentication token
   * @returns AppointmentResponse with appointment details and payment URL
   */
  createAppointment: async (
    request: AppointmentRequest,
    token: string
  ): Promise<AppointmentResponse> => {
    try {
      const httpClient = createServerApiClient(token);
      const response = await httpClient.post<ApiResponse<AppointmentResponse>>(
        `${API.APPOINTMENT}/create`,
        request
      );

      if (!response.data || !response.data.result) {
        throw new Error("Invalid response format");
      }

      return response.data.result;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  /**
   * Get doctor's appointments (for doctor dashboard)
   * GET /appointment
   *
   * @param token - Doctor authentication token
   * @returns Array of AppointmentResponse
   */
  getDoctorAppointments: async (
    token: string
  ): Promise<AppointmentResponse[]> => {
    try {
      const httpClient = createServerApiClient(token);
      const response = await httpClient.get<ApiResponse<AppointmentResponse[]>>(
        API.APPOINTMENT
      );

      if (!response.data || !response.data.result) {
        throw new Error("Invalid response format");
      }

      return response.data.result;
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      throw error;
    }
  },

  /**
   * Get patient's appointments (current user)
   * GET /appointment/my-appointments
   *
   * @param token - Patient authentication token
   * @returns Array of AppointmentResponse
   */
  getMyAppointments: async (token: string): Promise<AppointmentResponse[]> => {
    try {
      const httpClient = createServerApiClient(token);
      const response = await httpClient.get<ApiResponse<AppointmentResponse[]>>(
        `${API.APPOINTMENT}/my-appointments`
      );

      if (!response.data || !response.data.result) {
        throw new Error("Invalid response format");
      }

      return response.data.result;
    } catch (error) {
      console.error("Error fetching my appointments:", error);
      throw error;
    }
  },

  /**
   * Cancel appointment
   * PUT /appointment/cancel
   *
   * @param appointmentId - ID of appointment to cancel
   * @param token - User authentication token
   * @returns Updated AppointmentResponse with CANCELLED status
   */
  cancelAppointment: async (
    appointmentId: string,
    token: string
  ): Promise<AppointmentResponse> => {
    try {
      const httpClient = createServerApiClient(token);
      const response = await httpClient.put<ApiResponse<AppointmentResponse>>(
        `${API.APPOINTMENT}/cancel`,
        null,
        {
          params: {
            appointmentId,
          },
        }
      );

      if (!response.data || !response.data.result) {
        throw new Error("Invalid response format");
      }

      return response.data.result;
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw error;
    }
  },

  /**
   * Delete appointment (hard delete)
   * DELETE /appointment
   *
   * @param appointmentId - ID of appointment to delete
   * @param token - User authentication token
   * @returns void (204 No Content expected)
   */
  deleteAppointment: async (
    appointmentId: string,
    token: string
  ): Promise<void> => {
    try {
      const httpClient = createServerApiClient(token);
      await httpClient.delete(`${API.APPOINTMENT}`, {
        params: {
          appointmentId,
        },
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  },
};

export default appointmentService;
