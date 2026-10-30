// src/pages/Login.tsx
import { useNavigate } from "react-router"
import { LoginModal } from "../components/ui/LoginModal.tsx"

export function Login() {
    const navigate = useNavigate()

    const handleLoginSuccess = (token: string) => {
        localStorage.setItem("authToken", token)
        navigate("/", { replace: true })
    }

    return (
        <div className="min-h-screen bg-background">
            <LoginModal isOpen={true} onLoginSuccess={handleLoginSuccess} />
        </div>
    )
}