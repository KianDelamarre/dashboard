import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Automatically check for updates
const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('A new dashboard version is available. Reload?')) {
            updateSW(true)
        }
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)