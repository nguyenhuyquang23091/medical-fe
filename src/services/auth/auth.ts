import { ERROR_MESSAGES } from "@/errors/errorCode";
import httpClient from "@/lib/apiClient";
import axios from "axios";
import { API } from "@/lib/config/configuration";




export interface RegisterData {
    username: string,
    email: string,
    password: string,
    dob: string
}


const authService = {
   
    register: async(credentials : RegisterData) => {

        // for registeration, the credentials should set to be false, no one want extra layer of security when registering
        try {
            const registerResponse = await httpClient.post(API.REGISTRATION, credentials, 
                {withCredentials : false}
            )
            return registerResponse.data;
        } catch(error){
           if( axios.isAxiosError(error)){
           throw {code : error.response?.data.code || 9999}
           } else if ( error instanceof Error){
            console.error("Error while regiring", error);
            throw error;
           }
           throw {code:9999}
          
        }
    },

    logout : async() => {
        try{
            await httpClient.post('/auth/logout');
            return true;
        } catch(error) {
            console.error('Error during logging', error);
            return false;
        }
        
    },
  
}
export default authService;



