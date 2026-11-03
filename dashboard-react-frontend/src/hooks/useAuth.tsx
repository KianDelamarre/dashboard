// src/hooks/useAuth.ts (or inside your AuthContext)
import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api/client";

interface JwtPayload {
    exp: number;
    sub?: string;
    [key: string]: any;
}

export function useAuth() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Parse JWT to read expiration
    const parseJwt = (token: string): JwtPayload | null => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(window.atob(base64));
        } catch (e) {
            return null;
        }
    };

    // Start timer to refresh token 5 seconds before it expires
    const startRefreshLoginTimer = useCallback((token: string) => {
        const payload = parseJwt(token);
        if (!payload || !payload.exp) return;

        const expiresInMs = payload.exp * 1000 - Date.now();
        const timeoutMs = expiresInMs - 5000;

        if (timeoutMs > 0) {
            setTimeout(() => {
                refreshLogin();
            }, timeoutMs);
        }
    }, []);

    // Refresh login using the HttpOnly cookie
    const refreshLogin = async () => {
        try {
            const response = await authApi.post("/login");
            const token = response.data.accessToken;
            setAccessToken(token);
            startRefreshLoginTimer(token);
        } catch (error) {
            console.error("Error refreshing login:", error);
            setAccessToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Run on mount to check session
    useEffect(() => {
        refreshLogin();
    }, []);

    const logout = async () => {
        try {
            await authApi.delete("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setAccessToken(null);
            window.location.reload();
        }
    };

    return { accessToken, isLoading, setAccessToken, startRefreshLoginTimer, logout, refreshLogin };
}