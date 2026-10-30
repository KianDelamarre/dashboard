// src/components/ui/LoginModal.tsx
import * as React from "react"
import { api } from "../../api/client" // Using configured axios instance

interface LoginModalProps {
    isOpen: boolean
    onLoginSuccess: (token: string) => void
}

export function LoginModal({ isOpen, onLoginSuccess }: LoginModalProps) {
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    if (!isOpen) return null

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Matches vanilla JS fetch('/login') with credentials: 'include'
            const response = await api.post('/token', {
                username,
                password
            })

            const token = response.data.accessToken
            onLoginSuccess(token)
        } catch (err: any) {
            console.error("Login failed:", err)
            const status = err.response?.status
            setError(status ? `Invalid credentials (${status})` : "Login failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-2xl space-y-6">
                <div className="space-y-2 text-center">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Welcome Back</h2>
                    <p className="text-xs text-muted-foreground">Please sign in to manage your dashboard links.</p>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    )
}