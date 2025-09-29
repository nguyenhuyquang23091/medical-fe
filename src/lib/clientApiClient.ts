"use client";

import axios from 'axios';
import { API_GATEWAY_URL, PUBLIC_ENDPOINT } from './config/configuration';

/**
 * Simplified client-side API client
 * NextAuth handles token refresh automatically, so no interceptors needed
 */
export const createClientApiClient = (token?: string) => {
    const client = axios.create({
        baseURL: API_GATEWAY_URL.BASE_URL,
        timeout: 300000,
        headers: {
            "Content-Type": "application/json",
        }
    });

    // Simple request interceptor for auth and public endpoints
    client.interceptors.request.use((config) => {
        // Skip auth for public endpoints
        if (config.url && PUBLIC_ENDPOINT.has(config.url)) {
            return config;
        }
        // Use provided token if available
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    // Simple response interceptor - let NextAuth handle token refresh
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            // If 401 and no token refresh available, let it fail
            // NextAuth will handle refresh on next session call
            if (error?.response?.status === 401) {
                console.log("401 error - session may need refresh");
            }
            return Promise.reject(error);
        }
    );

    return client;
};

// Default client instance for backward compatibility
export default createClientApiClient();