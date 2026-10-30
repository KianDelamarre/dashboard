import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (originalRequest.url === '/token' || originalRequest.url === '/logout') {
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
        await api.post('/logout');
    } catch (e) {
        // Ignore errors so the user doesn't get trapped if the backend is down
    } finally {
        // Universal redirect (works everywhere, including outside React context)
        // Adjust to window.location.href = '/login' if you aren't using HashRouter
        window.location.href = '/#/login';
    }
}