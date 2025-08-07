import axios, {type InternalAxiosRequestConfig} from "axios";
import {BACKEND_URL} from "~/env";

export const Backend = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});

Backend.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    return config;
})
