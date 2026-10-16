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
    onBatchSave: (moves: MoveData[]) => void
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
    const [localItems, setLocalItems] = React.useState<CardLinkItem[]>(items)
    const [pendingMoves, setPendingMoves] = React.useState<MoveData[]>([])
    const [draggedId, setDraggedId] = React.useState<string | null>(null)

    // Only sync localItems from props if the parent's items prop actually changes from the outside
    const prevItemsRef = React.useRef(items)
    React.useEffect(() => {
        if (items !== prevItemsRef.current) {
            setLocalItems(items)
            prevItemsRef.current = items
        }
    }, [items])

    // Clear pending moves when exiting edit mode
    React.useEffect(() => {
        if (!isEditMode) {
            setPendingMoves([])
            setDraggedId(null)
            setLocalItems(items) // Reset local items when exiting edit mode
        }
    }, [isEditMode, items])

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        if (!isEditMode) return
        setDraggedId(id)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetColNum: number) => {
        e.preventDefault()
        if (!isEditMode || !draggedId) return

        const container = e.currentTarget
        const draggableElements = Array.from(container.querySelectorAll('.link-card-wrapper:not(.dragging)'))

        const afterElement = draggableElements.reduce<{ offset: number; element: HTMLElement | null }>((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = e.clientY - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child as HTMLElement }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element

        setLocalItems(prevItems => {
            const draggedItem = prevItems.find(i => String(i.id) === draggedId)
            if (!draggedItem) return prevItems

            const remainingItems = prevItems.filter(i => String(i.id) !== draggedId)
            let insertIndex = remainingItems.length

            if (afterElement) {
                const index = remainingItems.findIndex(i => String(i.id) === afterElement.id)
                if (index !== -1) {
                    insertIndex = index
                }
            }

            const updatedDraggedItem = { ...draggedItem, column: targetColNum }
            const newItems = [...remainingItems]
            newItems.splice(insertIndex, 0, updatedDraggedItem)

            return newItems.map((item, idx) => ({ ...item, row: idx + 1 }))
        })
    }

    const handleDrop = (targetColNum: number, container: HTMLElement, clientY: number) => {
        if (!draggedId) return

        const draggableElements = Array.from(container.querySelectorAll('.link-card-wrapper:not(.dragging)'))
        const afterElement = draggableElements.reduce<{ offset: number; element: HTMLElement | null }>((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = clientY - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child as HTMLElement }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element

        const newMove: MoveData = {
            idToMove: draggedId,
            relativeToId: afterElement ? afterElement.id : undefined,
            targetColumn: targetColNum
        }

        setPendingMoves(prev => {
            const filtered = prev.filter(m => m.idToMove !== draggedId)
            return [...filtered, newMove]
        })

        setDraggedId(null)
    }

    const handleDragEnd = () => {
        setDraggedId(null)
    }

    return (
        <div className="p-8 max-w-[90rem] mx-auto">
            {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                    {error}
                </div>
            )}

            {isEditMode && (
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => {
                            onBatchSave(pendingMoves)
                            window.location.reload()
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition-colors"
                    >
                        Save Position Changes ({pendingMoves.length})
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(COLUMN_MAP).map(([colNumStr, columnName]) => {
                    const colNum = Number(colNumStr)
                    const columnItems = localItems
                        .filter((item) => item.column === colNum)
                        .sort((a, b) => a.row - b.row)

                    return (
                        <div key={columnName} className="space-y-3">
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">
                                {columnName}
                            </h3>
                            <div className="h-px w-full bg-border my-4" />
                            <div
                                id={`column-${colNum}`}
                                className="space-y-3.5 min-h-[200px]"
                                onDragOver={(e) => handleDragOver(e, colNum)}
                                onDrop={(e) => handleDrop(colNum, e.currentTarget, e.clientY)}
                            >
                                {isLoading ? (
                                    <div className="h-12 w-full rounded-lg bg-card animate-pulse border border-border/20" />
                                ) : columnItems.length === 0 ? (
                                    <div className="text-xs text-muted-foreground italic px-1">No links in this column</div>
                                ) : (
                                    columnItems.map((item) => {
                                        const itemIdStr = String(item.id)
                                        const isThisDragging = draggedId === itemIdStr

                                        return (
                                            <div
                                                key={item.id}
                                                id={itemIdStr}
                                                draggable={isEditMode}
                                                onDragStart={(e) => handleDragStart(e, itemIdStr)}
                                                onDragEnd={handleDragEnd}
                                                className={`link-card-wrapper transition-all duration-150 ${isThisDragging ? 'opacity-40 dragging' : ''} ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                            >
                                                <LinkCard
                                                    id={itemIdStr}
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
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}