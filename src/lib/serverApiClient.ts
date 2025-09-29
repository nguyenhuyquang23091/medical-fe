import axios from 'axios';
import { API_GATEWAY_URL, PUBLIC_ENDPOINT } from './config/configuration';

/**
 * Server-side API client for server actions
 * No interceptors - direct token passing for server-side operations
 */
export const createServerApiClient = (token: string) => {
    const client = axios.create({
        baseURL: API_GATEWAY_URL.BASE_URL,
        timeout: 300000,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    // Simple request interceptor for public endpoints
    client.interceptors.request.use((config) => {
        // Skip auth for public endpoints
        if (config.url && PUBLIC_ENDPOINT.has(config.url)) {
            delete config.headers.Authorization;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    return client;
};

export default createServerApiClient;