import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { ApiResponse } from "@/types";
import { PaymentRequest, PaymentResponse } from "@/types/payment";


const paymentService = {
    createPayment : async (request : PaymentRequest, token : string ) : Promise<PaymentResponse> => {
        try {
            const httpClient = createServerApiClient(token)
            const response = await httpClient.post<ApiResponse<PaymentResponse>>(API.PAYMENT, request);
            console.log('Get My payment Response:', response.data);

          if(!response.data || !response.data.result){
            throw new Error("Invalid response format")
          }
          
          return response.data.result

        } catch ( error){
            console.error("error in fetching data response", error)
            throw error
        }
    }
}

export default paymentService;