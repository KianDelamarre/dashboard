import * as React from "react"
import { LinkCard } from "./LinkCard"
import { type ColumnItem } from "@/models/ColumnItem.tsx";
import { type CardLinkItem } from "@/models/CardLinkItem.tsx";
import { type MoveData } from "@/models/MoveData.tsx";
import { type BatchSavePayload } from "@/models/BatchSavePayload.tsx";

interface LinkCardGridProps {
    columns: ColumnItem[]
    items: CardLinkItem[]
    isLoading: boolean
    error: string | null
    isEditMode: boolean
    onUpdateLink: (id: number, updatedData: any) => void
    onDeleteLink: (id: number) => void
    onBatchSave: (payload: BatchSavePayload) => void
    onDeleteColumn: (columnId: number) => void
}

export function LinkCardGrid({
                                 columns,
                                 items,
                                 isLoading,
                                 error,
                                 isEditMode,
                                 onUpdateLink,
                                 onDeleteLink,
                                 onBatchSave,
                                 onDeleteColumn
                             }: LinkCardGridProps) {
    const [localItems, setLocalItems] = React.useState<CardLinkItem[]>(items)
    const [localColumns, setLocalColumns] = React.useState<ColumnItem[]>(columns)
    const [pendingMoves, setPendingMoves] = React.useState<MoveData[]>([])
    const [draggedId, setDraggedId] = React.useState<string | null>(null)

    // Sync localItems when items prop updates
    const prevItemsRef = React.useRef(items)
    React.useEffect(() => {
        if (items !== prevItemsRef.current) {
            setLocalItems(items)
            prevItemsRef.current = items
        }
    }, [items])

    // Sync localColumns when columns prop updates
    const prevColumnsRef = React.useRef(columns)
    React.useEffect(() => {
        if (columns !== prevColumnsRef.current) {
            setLocalColumns(columns)
            prevColumnsRef.current = columns
        }
    }, [columns])

    // Clear pending changes & reset local state when exiting edit mode
    React.useEffect(() => {
        if (!isEditMode) {
            setPendingMoves([])
            setDraggedId(null)
            setLocalItems(items)
            setLocalColumns(columns)
        }
    }, [isEditMode, items, columns])

    const handleColumnNameChange = (columnId: number, newName: string) => {
        setLocalColumns(prev =>
            prev.map(col => (col.id === columnId ? { ...col, name: newName } : col))
        )
    }

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

    // Sort columns dynamically based on displayOrder
    const sortedColumns = [...localColumns].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

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
                            onBatchSave({
                                columns: localColumns,
                                moves: pendingMoves
                            })
                            // window.location.reload()
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition-colors"
                    >
                        Save Changes ({pendingMoves.length} card moves)
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {sortedColumns.map((col) => {
                    const colNum = col.id
                    const columnName = col.name
                    const columnItems = localItems
                        .filter((item) => item.column === colNum)
                        .sort((a, b) => a.row - b.row)

                    return (
                        <div key={colNum} className="space-y-3">
                            {/* Conditional Column Header / Input */}
                            {isEditMode ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={columnName}
                                        onChange={(e) => handleColumnNameChange(colNum, e.target.value)}
                                        className="w-full px-2 py-1 text-xs font-semibold tracking-wider uppercase bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                        placeholder="Column Name"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const confirmed = window.confirm(
                                                `Are you sure you want to delete the column "${columnName}"?\n\nAll links inside this column will also be deleted.`
                                            );
                                            if (confirmed) {
                                                onDeleteColumn(colNum);
                                            }
                                        }}
                                        className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-md text-xs transition-colors shrink-0"
                                        title="Delete Column"
                                    >
                                        ✕
                                    </button>
                                </div>

                            ) : (
                                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">
                                    {columnName}
                                </h3>
                            )}

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
                                                    cardLinkData={item}
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