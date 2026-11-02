import * as React from "react"
import { dataApi } from "@/api/client.tsx";
import { Button } from "./Button"
import { X, Plus } from "lucide-react"
import { type ColumnItem } from "../ui/LinkCardGrid"

interface NewColumnModalProps {
    isOpen: boolean
    onClose: () => void
    onColumnCreated: (newColumn: ColumnItem) => void
}

export function NewColumnModal({ isOpen, onClose, onColumnCreated }: NewColumnModalProps) {
    const [name, setName] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    if (!isOpen) return null

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Send payload matching your ColumnDto structure expected by @PostMapping("/column")
            const response = await dataApi.post<ColumnItem>(`/column`, {
                name,
                // Include displayOrder or other fields if your ColumnDto requires them
            })

            console.log("Successfully created column:", response.data)
            onColumnCreated(response.data)

            setName("")
            onClose()
        } catch (error) {
            console.error("Failed to create column:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 rounded-lg bg-card border border-border/40 shadow-xl text-card-foreground"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
                    <h2 className="text-lg font-semibold">Create New Column</h2>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={isLoading}
                        className="h-8 w-8 rounded-md"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleCreate} className="space-y-4">
                    <fieldset disabled={isLoading} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Column Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Monitoring, Tools, Media"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                required
                            />
                        </div>
                    </fieldset>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-ring text-primary-foreground hover:bg-ring/90"
                            disabled={isLoading}
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            {isLoading ? "Creating..." : "Create Column"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}