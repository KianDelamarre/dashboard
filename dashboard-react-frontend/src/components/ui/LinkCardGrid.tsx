import * as React from "react"
import axios from "axios"
import { LinkCard } from "./LinkCard"

interface CardLinkItem {
    id: number        // Updated from string to number
    name: string
    localUrl: string
    remoteUrl: string
    imgUrl: string
    column: number    // Updated from string to number
    row: number
}

interface LinkCardGridProps {
    isEditMode: boolean
}

const API_URL = 'http://localhost:8080'

// Map your numeric column IDs from the database/API to display names
const COLUMN_MAP: Record<number, string> = {
    1: "MEDIA",
    2: "SERVICES",
    3: "LINKS",
    4: "ADMIN"
}

export function LinkCardGrid({ isEditMode }: LinkCardGridProps) {

    const [items, setItems] = React.useState<CardLinkItem[]>([])
    const [isLoading, setIsLoading] = React.useState<boolean>(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const fetchLinks = async () => {
            try {
                setIsLoading(true)
                const response = await axios.get<CardLinkItem[]>(`${API_URL}/links`)
                setItems(response.data)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch links from API:", err)
                setError("Could not connect to backend server. Please check if your API is running.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchLinks()
    }, [])

    return (
        <div className="p-8 max-w-[90rem] mx-auto">
            {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(COLUMN_MAP).map(([colNumStr, columnName]) => {
                    const colNum = Number(colNumStr)

                    // Filter items matching this column number and sort by row
                    const columnItems = items
                        .filter((item) => item.column === colNum)
                        .sort((a, b) => a.row - b.row)

                    return (
                        <div key={columnName} className="space-y-3">
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">
                                {columnName}
                            </h3>

                            <div className="h-px w-full bg-border my-4" />

                            <div className="space-y-3.5">
                                {isLoading ? (
                                    <div className="h-12 w-full rounded-lg bg-card animate-pulse border border-border/20" />
                                ) : columnItems.length === 0 ? (
                                    <div className="text-xs text-muted-foreground italic px-1">No links in this column</div>
                                ) : (
                                    columnItems.map((item) => (
                                        <LinkCard
                                            key={item.id}
                                            id={String(item.id)}
                                            name={item.name}
                                            localUrl={item.localUrl}
                                            remoteUrl={item.remoteUrl}
                                            imgUrl={item.imgUrl}
                                            column={columnName}
                                            row={item.row}
                                            isEditMode={isEditMode}
                                        />
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