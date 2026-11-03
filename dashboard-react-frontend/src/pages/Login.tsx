// src/pages/Login.tsx
import { useNavigate } from "react-router"
import { LoginModal } from "../components/ui/LoginModal.tsx"

export function Login() {
    const navigate = useNavigate()

    const handleLoginSuccess = () => {
        // No token parameter needed here anymore!
        // The backend has already securely set the HttpOnly cookie in the browser.

        // Just redirect the user to the dashboard:
        navigate("/", { replace: true })
    }

    return (
        <div className="min-h-screen bg-background">
            <LoginModal isOpen={true} onLoginSuccess={handleLoginSuccess} />
        </div>
    )
}