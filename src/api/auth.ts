import apiClient from "../lib/apiClient";


export interface RegisterData {
    username: string,
    email: string,
    password: string,
    dob: string
}


const authService = {
   
    register: async(credentials : RegisterData) => {
        try {
            const registerResponse = await apiClient.post("/users", credentials)
            return registerResponse.data;
        } catch(error){
            console.error('Register error', error)
            return false;
        }
    },

    logout : async() => {
        try{
            await apiClient.post('/auth/logout');
            return true;
        } catch(error) {
            console.error('Error during logging', error);
            return false;
        }
        
    },
  
}
export default authService;



