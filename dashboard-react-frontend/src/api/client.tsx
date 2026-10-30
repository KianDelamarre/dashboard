import axios from "axios";

// If in production (bundled), use a relative path ("").
// If in development (Vite), fallback to localhost:8080.
const baseURL = import.meta.env.PROD
    ? ""
    : "http://localhost:8080";

export const authApi = axios.create({
    baseURL: `${baseURL}/auth`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. Client specifically for Core Data resources (/api/links, etc.)
export const dataApi = axios.create({
    baseURL: `${baseURL}/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response Interceptor
dataApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/logout') {
                return Promise.reject(error);
            }

            console.warn("Session expired or unauthorized. Redirecting to login...");

            // Clean up and redirect globally
            await logout();
        }

        return Promise.reject(error);
    }
);

// Centralized Logout Helper
export async function logout() {
    try {
        await authApi.post('/logout');
    } catch (e) {
        // Ignore errors so the user doesn't get trapped if the backend is down
    } finally {
        // Universal redirect (works everywhere, including outside React context)
        // Adjust to window.location.href = '/login' if you aren't using HashRouter
        window.location.href = '/#/login';
    }
}