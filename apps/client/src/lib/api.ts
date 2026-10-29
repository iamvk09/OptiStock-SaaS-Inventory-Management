import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const api = axios.create({
    baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
    const { token, organizationId } = useAuthStore.getState();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (organizationId) {
        config.headers["x-organization-id"] = organizationId;
    }
    return config;
});
