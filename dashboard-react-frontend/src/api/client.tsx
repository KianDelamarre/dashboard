import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080", // Match your API server URL
    withCredentials: false,             // Crucial: sends/receives HttpOnly cookies
    headers: {
        "Content-Type": "application/json",
    },
});