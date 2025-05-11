import apiClient from "../app/libs/apiClient";

export interface LoginCredentials {
     username ? : string,
     email : string;
     password: string

}
export interface RegisterData {
    username: string,
    email: string,
    password: string,
    dob: string
}


const authService = {
    login: async(credentials: LoginCredentials) => {
        try{
            const response = await apiClient.post("/auth/token", credentials)
            return response.data.isAuthenticated;

        } catch(error){
            console.error('Login error', error)
            return false;
        }
    },

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
    checkAuth : async(token: string) => {
        try{
            const response = await apiClient.post('/auth/introspect', token);
            return response.data;
        } catch(error){
            console.error("Error in introspect", error);
            return false;
        }
    }
   

}
export default authService;



