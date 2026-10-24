// src/components/ui/LoginModal.tsx
import * as React from "react"
import axios from "axios"

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
            // Replace with your actual backend login endpoint
            const response = await axios.post('http://localhost:8080/auth/login', {
                username,
                password
            })

            const token = response.data.token // Adjust based on your backend response structure
            localStorage.setItem("authToken", token)
            onLoginSuccess(token)
        } catch (err) {
            console.error("Login failed:", err)
            setError("Invalid username or password.")
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
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    )
}