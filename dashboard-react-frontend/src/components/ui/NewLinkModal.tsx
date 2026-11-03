import * as React from "react"
import { dataApi } from "@/api/client.tsx";
import { Button } from "./Button"
import { X, Plus } from "lucide-react"

import { type ColumnItem } from "@/models/ColumnItem.tsx";


interface NewLinkModalProps {
    isOpen: boolean
    onClose: () => void
    onLinkCreated: (newLink: any) => void
    columns: ColumnItem[]
}


export function NewLinkModal({ isOpen, onClose, onLinkCreated, columns = [] }: NewLinkModalProps) {
    const [name, setName] = React.useState("")
    const [remoteUrl, setRemoteUrl] = React.useState("")
    const [localUrl, setLocalUrl] = React.useState("")
    const [imgUrl, setImgUrl] = React.useState("")

    // Default to the first column's ID if available, otherwise 1
    const [column, setColumn] = React.useState<number>(columns.length > 0 ? columns[0].id : 1)
    const [isLoading, setIsLoading] = React.useState(false)

    // Update default state if columns change/load later
    React.useEffect(() => {
        if (columns.length > 0 && !columns.some(c => c.id === column)) {
            setColumn(columns[0].id);
        }
    }, [columns]);

    if (!isOpen) return null

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await dataApi.post(`/link`, {
                name,
                remoteUrl,
                localUrl,
                imgUrl,
                column, // <-- Fixed to use the selected column state
                row: 9999,
            })

            console.log("Successfully created link:", response.data)
            onLinkCreated(response.data)

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

                        {/* Column Selection (Dynamic) */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Column Section</label>
                            <select
                                value={column}
                                onChange={(e) => setColumn(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            >
                                {columns.map((col) => (
                                    <option key={col.id} value={col.id}>
                                        {col.name} ({col.id})
                                    </option>
                                ))}
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