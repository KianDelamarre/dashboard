import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Edit, Save, Plus, LogOut, X } from "lucide-react"
import { Button } from "./Button"

interface TopBarProps {
    isEditMode: boolean
    setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>
}

export function TopBar({ isEditMode, setIsEditMode }: TopBarProps) {

    return (
        <header className={cn("flex items-center justify-between gap-4 p-4 border-b bg-card")}>
            {/* 1. Favicon / Logo */}
            <div className="flex items-center gap-2 shrink-0">
                <img
                    src="/favicon.svg"
                    alt="Site Logo"
                    className="w-8 h-8 object-contain"
                />
            </div>

            {/* 2. Search Bar */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* 3. Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">

                {isEditMode && (
                    <>
                        {/* Save Button */}
                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => {
                                console.log("save button clicked")
                                setIsEditMode(false)
                            }}
                            className="bg-green text-primary-foreground hover:bg-green/90 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </Button>

                        {/* New Link Button */}
                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => console.log("new link button clicked")}
                            className="bg-ring text-primary-foreground hover:bg-ring/90 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            New Link
                        </Button>
                    </>
                )}

                {/* Toggle Edit Mode Button */}
                <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => setIsEditMode(prev => !prev)}
                    className="bg-orange text-primary-foreground hover:bg-orange/90 transition-all"
                >
                    {isEditMode ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    {isEditMode ? "Cancel" : "Edit"}
                </Button>

                {/* Logout Button */}
                <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => console.log("Logout clicked")}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        </header>
    )
}