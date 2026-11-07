import * as React from "react"
import { X, Loader2, Compass, ExternalLink, CheckSquare, Square, Plus } from "lucide-react"
import { Button } from "./Button"
import { dataApi } from "@/api/client.tsx"
import type { DiscoveredLinkInfo } from "@/models/DiscoveredLinkInfo.tsx"
import type { CardLinkItem } from "@/models/CardLinkItem.tsx"

interface DiscoveryModalProps {
    isOpen: boolean
    onClose: () => void
    isDiscovering: boolean
    discoveredLinks: DiscoveredLinkInfo[]
    onLinksImported?: (importedLinks: CardLinkItem[]) => void
}

export function DiscoveryModal({
                                   isOpen,
                                   onClose,
                                   isDiscovering,
                                   discoveredLinks,
                                   onLinksImported,
                               }: DiscoveryModalProps) {
    // Store selected URLs instead of index strings
    const [selectedUrls, setSelectedUrls] = React.useState<Set<string>>(new Set())
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Reset selection when modal opens/closes or links change
    React.useEffect(() => {
        setSelectedUrls(new Set())
        setError(null)
    }, [isOpen, discoveredLinks])

    if (!isOpen) return null

    // Toggle selection by URL
    const toggleSelect = (url: string) => {
        setSelectedUrls((prev) => {
            const next = new Set(prev)
            if (next.has(url)) {
                next.delete(url)
            } else {
                next.add(url)
            }
            return next
        })
    }

    // Toggle select all using URLs
    const toggleSelectAll = () => {
        if (selectedUrls.size === discoveredLinks.length) {
            setSelectedUrls(new Set())
        } else {
            const allUrls = discoveredLinks.map((link) => link.url)
            setSelectedUrls(new Set(allUrls))
        }
    }

    // Handle batch submission to POST /create-multiple
    const handleCreateSelected = async () => {
        if (selectedUrls.size === 0) return

        try {
            setIsSubmitting(true)
            setError(null)

            // Filter selected links by matching their URLs
            const linksToImport = discoveredLinks.filter((link) => selectedUrls.has(link.url))

            // Map to payload matching CardLinkItem structure
            const payload = linksToImport.map((link) => ({
                title: link.title || link.url,
                url: link.url,
            }))

            const response = await dataApi.post<CardLinkItem[]>('/create-multiple', {
                links: payload,
            })

            console.log("Links successfully imported:", response.data)

            if (onLinksImported) {
                onLinksImported(response.data)
            }

            onClose()
        } catch (err: any) {
            console.error("Failed to import selected links:", err)
            setError("Failed to import links. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in-0">
            <div className="relative w-full max-w-xl bg-card border rounded-lg shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Discovered Links</h2>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isDiscovering ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Scanning for new links and resources...
                            </p>
                        </div>
                    ) : discoveredLinks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-2 text-center text-muted-foreground">
                            <Compass className="w-10 h-10 opacity-40" />
                            <p className="text-sm">No new links were discovered.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <span className="text-xs text-muted-foreground">
                                    Found {discoveredLinks.length} potential link{discoveredLinks.length === 1 ? "" : "s"}.
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    {selectedUrls.size === discoveredLinks.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-md">
                                    {error}
                                </div>
                            )}

                            {discoveredLinks.map((link) => {
                                const isSelected = selectedUrls.has(link.url)

                                return (
                                    <div
                                        key={link.url}
                                        onClick={() => toggleSelect(link.url)}
                                        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors gap-3 ${
                                            isSelected ? "bg-accent/40 border-primary/50" : "bg-background/50 hover:bg-accent/30"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <button
                                                type="button"
                                                className="text-primary focus:outline-none"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleSelect(link.url)
                                                }}
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </button>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-medium truncate">
                                                    {link.title || link.url}
                                                </h4>
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs text-muted-foreground hover:underline truncate flex items-center gap-1 mt-0.5"
                                                >
                                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{link.url}</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                        {selectedUrls.size} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            disabled={selectedUrls.size === 0 || isSubmitting}
                            onClick={handleCreateSelected}
                            className="gap-1.5"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            {isSubmitting ? "Importing..." : "Import Selected"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}