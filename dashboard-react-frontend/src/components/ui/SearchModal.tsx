import * as React from "react"
import { X } from "lucide-react"
import { LinkDetails } from "./LinkDetails"
import { cn } from "@/lib/utils"
import { type CardLinkItem } from "@/models/CardLinkItem.tsx"
import { type LinkStatusResponse } from "@/models/LinkStatusResponse.tsx"

interface SearchModalProps {
    isOpen: boolean
    query: string
    onClose: () => void
    items: CardLinkItem[]
    statuses: Record<number, LinkStatusResponse>
    openInNewTab?: boolean
    topOffset: number
    inputKeyDownRef?: React.MutableRefObject<((e: React.KeyboardEvent<HTMLInputElement>) => void) | null>
}

export function SearchModal({
                                isOpen,
                                query,
                                onClose,
                                items,
                                statuses,
                                openInNewTab = false,
                                topOffset,
                                inputKeyDownRef,
                            }: SearchModalProps) {
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    const normalizedQuery = query.trim().toLowerCase()
    const filteredItems = React.useMemo(() => {
        if (!normalizedQuery) return items
        return items.filter(
            (item) =>
                item.name.toLowerCase().includes(normalizedQuery) ||
                item.remoteUrl?.toLowerCase().includes(normalizedQuery) ||
                item.localUrl?.toLowerCase().includes(normalizedQuery)
        )
    }, [items, normalizedQuery])

    // Reset selection to top result whenever the query or open state changes
    React.useEffect(() => {
        setSelectedIndex(0)
    }, [query, isOpen])

    // Clamp index if filteredItems shrinks
    React.useEffect(() => {
        if (selectedIndex >= filteredItems.length) {
            setSelectedIndex(Math.max(0, filteredItems.length - 1))
        }
    }, [filteredItems.length, selectedIndex])

    const navigateToItem = React.useCallback(
        (item: CardLinkItem | undefined) => {
            if (!item?.remoteUrl) return
            if (openInNewTab) {
                window.open(item.remoteUrl, "_blank", "noopener,noreferrer")
            } else {
                window.location.assign(item.remoteUrl)
            }
            onClose()
        },
        [openInNewTab, onClose]
    )

    // Listen for Escape while open
    React.useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onClose])

    // Expose arrow + Enter handler to the static search bar input
    React.useEffect(() => {
        if (!inputKeyDownRef) return

        inputKeyDownRef.current = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!isOpen || filteredItems.length === 0) return

            if (e.key === "ArrowDown") {
                e.preventDefault()
                setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
            } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
            } else if (e.key === "Enter") {
                e.preventDefault()
                navigateToItem(filteredItems[selectedIndex] ?? filteredItems[0])
            }
        }
    }, [inputKeyDownRef, isOpen, filteredItems, selectedIndex, navigateToItem])

    if (!isOpen) return null

    return (
        <div
            style={{ top: `${topOffset}px` }}
            className="fixed left-0 w-screen bottom-0 z-40 bg-background/95 backdrop-blur-sm overflow-y-auto border-t border-border/40 animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="px-8 pt-4 pb-8 max-w-[90rem] mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Optional close row in top-right of the results area */}
                <div className="flex justify-end mb-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                        title="Close search (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Results Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-12 text-center">
                        No links matching &ldquo;{query}&rdquo;
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map((item, idx) => {
                            const isSelected = idx === selectedIndex
                            return (
                                <LinkDetails
                                    key={item.id}
                                    cardLinkData={item}
                                    linkStatusResponse={statuses[item.id]}
                                    openInNewTab={openInNewTab}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={cn(
                                        isSelected &&
                                        "-translate-y-0.5 border-border-hover bg-card-hover ring-2 ring-primary"
                                    )}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}