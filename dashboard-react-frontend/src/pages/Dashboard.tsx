import * as React from "react"
import { dataApi } from "../api/client.tsx" // Using configured axios instance

import { useNavigate } from "react-router"
import { TopBar } from "../components/ui/TopBar"
import { LinkCardGrid } from "../components/ui/LinkCardGrid"
import { NewLinkModal } from "../components/ui/NewLinkModal"

interface ColumnItem {
    id: number
    name: string
    displayOrder?: number
}

interface CardLinkItem {
    id: number
    name: string
    localUrl: string
    remoteUrl: string
    imgUrl: string
    column: number
    row: number
}

interface DashboardDataResponse {
    columns: ColumnItem[]
    links: CardLinkItem[]
}

export function Dashboard() {
    const navigate = useNavigate()
    const [isEditMode, setIsEditMode] = React.useState(false)
    const [columns, setColumns] = React.useState<ColumnItem[]>([])
    const [items, setItems] = React.useState<CardLinkItem[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [isNewModalOpen, setIsNewModalOpen] = React.useState(false)
    const [batchMoves, setBatchMoves] = React.useState<any[]>([])

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true)
                const response = await dataApi.get<DashboardDataResponse>(`/dashboard`)
                setColumns(response.data.columns)
                setItems(response.data.links)
                setError(null)
            } catch (err: any) {
                console.error("Failed to fetch dashboard data:", err)
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem("authToken")
                    navigate("/login", { replace: true })
                } else {
                    setError("Could not connect to backend server.")
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchDashboardData()
    }, [navigate])

    const handleLinkUpdated = (id: string, updatedData: any) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === Number(id) ? { ...item, ...updatedData } : item
            )
        )
    }

    const handleLinkCreated = (newLink: CardLinkItem) => {
        setItems((prevItems) => [...prevItems, newLink])
    }

    const handleLinkDeleted = (deletedId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== Number(deletedId)))
    }

    const handleBatchSave = async (moves: any[]) => {
        if (moves.length > 0) {
            try {
                await dataApi.patch(`/links/batchmove`, moves)
                console.log("Batch move successful!")
            } catch (err) {
                console.error("Failed to execute batch move:", err)
            }
        }
        setIsEditMode(false)
        window.location.reload()
    }

    const handleSaveChanges = async () => {
        if (batchMoves.length > 0) {
            try {
                await dataApi.patch(`/links/batchmove`, batchMoves)
                console.log("Batch move successful!")
                setBatchMoves([])
            } catch (err) {
                console.error("Failed to execute batch move:", err)
            }
        }
        setIsEditMode(false)
    }

    return (
        <>
            <TopBar
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                onOpenNewModal={() => setIsNewModalOpen(true)}
                onSave={handleSaveChanges}
            />
            <LinkCardGrid
                columns={columns}
                items={items}
                isLoading={isLoading}
                error={error}
                isEditMode={isEditMode}
                onUpdateLink={handleLinkUpdated}
                onDeleteLink={handleLinkDeleted}
                onBatchSave={handleBatchSave}
            />
            <NewLinkModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onLinkCreated={handleLinkCreated}
            />
        </>
    )
}