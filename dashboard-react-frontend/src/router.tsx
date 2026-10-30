import * as React from "react"
import { createHashRouter, Navigate } from "react-router"
import { Dashboard } from "./pages/Dashboard"
import { Login } from "./pages/Login"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = !!localStorage.getItem("authToken")
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }
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