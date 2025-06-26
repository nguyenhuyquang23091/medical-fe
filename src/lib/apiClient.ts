import axios from 'axios'
import { API_GATEWAY_URL, API, PUBLIC_ENDPOINT } from './config/configuration';
import { getSession } from 'next-auth/react';


const httpClient = axios.create({
    baseURL : API_GATEWAY_URL.BASE_URL,
    timeout: 300000,
    headers: {
        "Content-Type": "application/json",
    }
});

httpClient.interceptors.request.use(async (config) => {

    if(config.url && PUBLIC_ENDPOINT.has(config.url)) {
        return config;
    }
    const session = await getSession();
    if(session?.accessToken){
        config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default httpClient;

