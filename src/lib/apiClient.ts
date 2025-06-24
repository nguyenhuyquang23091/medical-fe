import axios from 'axios'
import { API_GATEWAY_URL, API } from './config/configuration';

const httpClient = axios.create({
    

    baseURL : API_GATEWAY_URL.BASE_URL,
    timeout: 300000,
    headers: {
        "Content-Type": "application/json",
    }
})

export default httpClient;

