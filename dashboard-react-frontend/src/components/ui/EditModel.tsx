import * as React from "react"
import { cn } from "cn"
import axios from "axios"
import { Button } from "./Button"
import { X, Save } from "lucide-react"

interface EditModalProps {
    id: string
    isOpen: boolean
    onClose: () => void
    localUrl: string
    remoteUrl: string
    name: string
    imgUrl: string
    column: number,
    row: number,
    onSaveSuccess: (updatedData: { name: string; remoteUrl: string; localUrl: string; imgUrl: string }) => void // Added callback
}

const API_URL = 'http://localhost:8080'

export function EditModal({
    id,
    isOpen,
    onClose,
    localUrl,
    remoteUrl,
    name,
    imgUrl,
    column,
    row,
    onSaveSuccess

}: EditModalProps) {
    // Local form state populated by the incoming props
    const [formLocalUrl, setFormLocalUrl] = React.useState(localUrl)
    const [formRemoteUrl, setFormRemoteUrl] = React.useState(remoteUrl)
    const [formName, setFormName] = React.useState(name)
    const [formImgUrl, setFormImgUrl] = React.useState(imgUrl)
    const [isLoading, setIsLoading] = React.useState(false)

    // Keep local state in sync if props change or modal re-opens for a different card
    React.useEffect(() => {
        setFormLocalUrl(localUrl)
        setFormRemoteUrl(remoteUrl)
        setFormName(name)
        setFormImgUrl(imgUrl)
    }, [localUrl, remoteUrl, name, imgUrl, isOpen])

    // Don't render anything if visibility prop is false
    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const payload = {
                id: Number(id),
                name: formName,
                remoteUrl: formRemoteUrl,
                localUrl: formLocalUrl,
                imgUrl: formImgUrl,
                column: column,
                row: row,
            }

            const response = await axios.patch(`${API_URL}/link/${id}`, payload)

            console.log("Successfully updated link:", response.data)

            // Pass updated data back up to the parent!
            onSaveSuccess({
                name: formName,
                remoteUrl: formRemoteUrl,
                localUrl: formLocalUrl,
                imgUrl: formImgUrl,
            })

            onClose()
        } catch (error) {
            console.error("Failed to update link:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        /* Backdrop click-to-close */
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm "
        >
            {/* Stop propagation so clicking inside the modal doesn't close it */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 rounded-lg bg-card border border-border/40 shadow-xl text-card-foreground"
            >

                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
                    <h2 className="text-lg font-semibold">Edit Link Card</h2>
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
                <form onSubmit={handleSave} className="space-y-4">

                    {/* Fieldset disables all nested inputs automatically when isLoading is true */}
                    <fieldset disabled={isLoading} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Name</label>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                required
                            />
                        </div>

                        {/* Remote URL Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Remote URL</label>
                            <input
                                type="text"
                                value={formRemoteUrl}
                                onChange={(e) => setFormRemoteUrl(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                required
                            />
                        </div>

                        {/* Local URL Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Local URL</label>
                            <input
                                type="text"
                                value={formLocalUrl}
                                onChange={(e) => setFormLocalUrl(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            />
                        </div>

                        {/* Image URL Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Image URL</label>
                            <input
                                type="text"
                                value={formImgUrl}
                                onChange={(e) => setFormImgUrl(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
                            className="bg-green text-primary-foreground hover:bg-green/90"
                            disabled={isLoading}
                        >
                            <Save className="w-4 h-4 mr-1.5" />
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    )
}