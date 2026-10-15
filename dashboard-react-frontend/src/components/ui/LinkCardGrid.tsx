import * as React from "react"
import { LinkCard } from "./LinkCard"

interface CardLinkItem {
    id: number
    name: string
    localUrl: string
    remoteUrl: string
    imgUrl: string
    column: number
    row: number
}

interface MoveData {
    idToMove: string
    relativeToId?: string
    targetColumn: number
}

interface LinkCardGridProps {
    items: CardLinkItem[]
    isLoading: boolean
    error: string | null
    isEditMode: boolean
    onUpdateLink: (id: string, updatedData: any) => void
    onDeleteLink: (id: string) => void
    onBatchSave: (moves: MoveData[]) => void // <-- Accepts the compiled batch instruction array
}

const COLUMN_MAP: Record<number, string> = {
    1: "MEDIA",
    2: "SERVICES",
    3: "LINKS",
    4: "ADMIN"
}

export function LinkCardGrid({
    items,
    isLoading,
    error,
    isEditMode,
    onUpdateLink,
    onDeleteLink,
    onBatchSave
}: LinkCardGridProps) {
    // Local state to accumulate batch movements just like your vanilla JS script
    const [pendingMoves, setPendingMoves] = React.useState<MoveData[]>([])

    // Clear pending moves when exiting edit mode
    React.useEffect(() => {
        if (!isEditMode) {
            setPendingMoves([])
        }
    }, [isEditMode])

    const getAfterElement = (container: HTMLElement, y: number) => {
        const draggableElements = Array.from(container.querySelectorAll('.link-card-wrapper:not(.dragging)'))

        interface ClosestAcc {
            offset: number
            element: HTMLElement | null
        }

        return draggableElements.reduce<ClosestAcc>((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child as HTMLElement }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (!isEditMode) return

        const container = e.currentTarget
        const draggable = document.querySelector('.dragging') as HTMLElement
        if (!draggable) return

        const afterElement = getAfterElement(container, e.clientY)
        const currentNextSibling = draggable.nextElementSibling

        if (afterElement === currentNextSibling) return

        if (afterElement == null) {
            container.appendChild(draggable)
        } else {
            container.insertBefore(draggable, afterElement)
        }
    }

    const handleCardDrop = (itemId: string, targetColNum: number, container: HTMLElement, clientY: number) => {
        const afterElement = getAfterElement(container, clientY)

        const newMove: MoveData = {
            idToMove: itemId,
            relativeToId: afterElement ? afterElement.id : undefined,
            targetColumn: targetColNum
        }

        // Accumulate or replace instructions for this card in the batch array
        setPendingMoves(prev => {
            const filtered = prev.filter(m => m.idToMove !== itemId)
            return [...filtered, newMove]
        })
    }

    return (
        <div className="p-8 max-w-[90rem] mx-auto">
            {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                    {error}
                </div>
            )}

            {/* Save Changes button that commits the JSON payload */}
            {isEditMode && (
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => onBatchSave(pendingMoves)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                    >
                        Save Position Changes ({pendingMoves.length})
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(COLUMN_MAP).map(([colNumStr, columnName]) => {
                    const colNum = Number(colNumStr)
                    const columnItems = items
                        .filter((item) => item.column === colNum)
                        .sort((a, b) => a.row - b.row)

                    return (
                        <div key={columnName} className="space-y-3">
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">
                                {columnName}
                            </h3>
                            <div className="h-px w-full bg-border my-4" />
                            <div
                                className="space-y-3.5 min-h-[200px]"
                                onDragOver={handleDragOver}
                            >
                                {isLoading ? (
                                    <div className="h-12 w-full rounded-lg bg-card animate-pulse border border-border/20" />
                                ) : columnItems.length === 0 ? (
                                    <div className="text-xs text-muted-foreground italic px-1">No links in this column</div>
                                ) : (
                                    columnItems.map((item) => (
                                        <div
                                            key={item.id}
                                            id={String(item.id)}
                                            draggable={isEditMode}
                                            onDragStart={(e) => e.currentTarget.classList.add('dragging')}
                                            onDragEnd={(e) => {
                                                const cardWrapper = e.currentTarget
                                                cardWrapper.classList.remove('dragging')
                                                handleCardDrop(
                                                    String(item.id),
                                                    colNum,
                                                    cardWrapper.parentElement as HTMLElement,
                                                    e.clientY
                                                )
                                            }}
                                            className={`link-card-wrapper ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                        >
                                            <LinkCard
                                                id={String(item.id)}
                                                name={item.name}
                                                localUrl={item.localUrl}
                                                remoteUrl={item.remoteUrl}
                                                imgUrl={item.imgUrl}
                                                column={colNum}
                                                row={item.row}
                                                isEditMode={isEditMode}
                                                onUpdate={onUpdateLink}
                                                onDelete={onDeleteLink}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}