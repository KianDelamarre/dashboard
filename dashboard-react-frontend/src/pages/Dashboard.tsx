import * as React from "react"
import { dataApi } from "../api/client.tsx" // Using configured axios instance
import { type CardLinkItem } from "../components/ui/LinkCard.tsx"


import { useNavigate } from "react-router"
import { TopBar } from "../components/ui/TopBar"
import { LinkCardGrid, type ColumnItem , type BatchSavePayload } from "../components/ui/LinkCardGrid"
import { NewLinkModal } from "../components/ui/NewLinkModal"
import { NewColumnModal } from "../components/ui/NewColumnModal.tsx" // Ensure this is imported

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
    const [isNewColumnModalOpen, setIsNewColumnModalOpen] = React.useState(false)

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

    const handleLinkUpdated = (id: number, updatedData: any) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === Number(id) ? { ...item, ...updatedData } : item
            )
        )
    }

    const handleLinkCreated = (newLink: CardLinkItem) => {
        setItems((prevItems) => [...prevItems, newLink])
    }

    const handleLinkDeleted = (deletedId: number) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== Number(deletedId)))
    }

    // Handler to append the newly created column to local state
    const handleColumnCreated = (newColumn: ColumnItem) => {
        setColumns((prevColumns) => [...prevColumns, newColumn])
    }

    const handleBatchSave = async (payload: BatchSavePayload) => {
        try {
            const requestBody = {
                columnDtoList: payload.columns,
                moveRequestList: payload.moves
            };

            // Capture the fresh DashboardDataResponse from the backend
            const response = await dataApi.patch<DashboardDataResponse>('/links/batchsave', requestBody);

            // Instantly sync frontend state with the source of truth from the server
            setColumns(response.data.columns);
            setItems(response.data.links);

            console.log("Batch save & state sync successful!");

        } catch (err) {
            console.error("Failed to execute batch save:", err);
        } finally {
            setIsEditMode(false);
            // No reload needed! State updates cleanly in place.
        }
    }

    const handleDeleteColumn = async (columnId: number) => {
        try {
            await dataApi.delete(`/column/${columnId}`);

            // 1. Remove the column from local state
            setColumns(prev => prev.filter(col => col.id !== columnId));

            // 2. Remove all links associated with this column from local state
            setItems(prev => prev.filter(item => item.column !== columnId));

            console.log("Column " + columnId + " and its links deleted");

        } catch (err) {
            console.error("Failed to delete column:", err);
        }
    }

    return (
        <>
            <TopBar
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                onOpenNewModal={() => setIsNewModalOpen(true)}
                onOpenNewColumn={() => setIsNewColumnModalOpen(true)}
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
                onDeleteColumn={handleDeleteColumn}
            />
            <NewLinkModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onLinkCreated={handleLinkCreated}
                columns={columns}
            />

            <NewColumnModal
                isOpen={isNewColumnModalOpen}
                onClose={() => setIsNewColumnModalOpen(false)}
                onColumnCreated={handleColumnCreated}
            />
        </>
    )
}