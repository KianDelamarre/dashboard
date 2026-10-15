import * as React from "react"
import { cn } from "cn"
import axios from "axios"
import { Button } from "./Button"
import { X, Plus } from "lucide-react"

interface NewLinkModalProps {
    isOpen: boolean
    onClose: () => void
    onLinkCreated: (newLink: any) => void
}

const API_URL = 'http://localhost:8080'

export function NewLinkModal({ isOpen, onClose, onLinkCreated }: NewLinkModalProps) {
    // Start with empty form fields for a new link
    const [name, setName] = React.useState("")
    const [remoteUrl, setRemoteUrl] = React.useState("")
    const [localUrl, setLocalUrl] = React.useState("")
    const [imgUrl, setImgUrl] = React.useState("")
    const [column, setColumn] = React.useState<number>(1) // Default to column 1 (MEDIA)
    const [isLoading, setIsLoading] = React.useState(false)

    // Don't render anything if visibility prop is false
    if (!isOpen) return null

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Send POST request to create a new link
            const response = await axios.post(`${API_URL}/link`, {
                name,
                remoteUrl,
                localUrl,
                imgUrl,
                column: 1,
                row: 9999, // Backend or sorting logic can handle row placement
            })

            console.log("Successfully created link:", response.data)

            // Pass the newly created link back up to update the grid state
            onLinkCreated(response.data)

            // Reset form and close modal
            setName("")
            setRemoteUrl("")
            setLocalUrl("")
            setImgUrl("")
            onClose()
        } catch (error) {
            console.error("Failed to create link:", error)
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
                    <h2 className="text-lg font-semibold">Create New Link</h2>
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
                            <label className="text-sm font-medium text-foreground">Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Grafana"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                required
                            />
                        </div>

                        {/* Remote URL Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Remote URL</label>
                            <input
                                type="text"
                                placeholder="https://..."
                                value={remoteUrl}
                                onChange={(e) => setRemoteUrl(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                required
                            />
                        </div>

                        {/* Local URL Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Local URL (Optional)</label>
                            <input
                                type="text"
                                placeholder="http://192.168..."
                                value={localUrl}
                                onChange={(e) => setLocalUrl(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            />
                        </div>

                        {/* Image URL Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Image / Favicon URL</label>
                            <input
                                type="text"
                                placeholder="/icons/grafana.png"
                                value={imgUrl}
                                onChange={(e) => setImgUrl(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            />
                        </div>

                        {/* Column Selection */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Column Section</label>
                            <select
                                value={column}
                                onChange={(e) => setColumn(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            >
                                <option value={1}>MEDIA (1)</option>
                                <option value={2}>SERVICES (2)</option>
                                <option value={3}>LINKS (3)</option>
                                <option value={4}>ADMIN (4)</option>
                            </select>
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
                            {isLoading ? "Creating..." : "Create Link"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}