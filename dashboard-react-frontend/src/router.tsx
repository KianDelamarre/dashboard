// src/router.tsx (or wherever your router lives)
import * as React from "react"
import { createHashRouter, Navigate } from "react-router"
import { Dashboard } from "./pages/Dashboard"
import { Login } from "./pages/Login"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // Since JavaScript can't read HttpOnly cookies, we let the route render.
    // Your Dashboard component's useEffect will automatically make an API call.
    // If the cookie is missing/invalid, the backend will return a 401,
    // and your catch block in Dashboard will redirect to /login
    return <>{children}</>
}

export const router = createHashRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
])