import * as React from "react"
import { dataApi } from "../api/client.tsx" // Using configured axios instance

import { type CardLinkItem} from "@/models/CardLinkItem.tsx";
import { type ColumnItem } from "@/models/ColumnItem.tsx";
import { type BatchSavePayload } from "@/models/BatchSavePayload.tsx";
import { type LinkStatusResponse } from "@/models/LinkStatusResponse.tsx"; // <-- Import status type

import { useNavigate } from "react-router"
import { TopBar } from "../components/ui/TopBar"
import { LinkCardGrid} from "../components/ui/LinkCardGrid"
import { NewLinkModal } from "../components/ui/NewLinkModal"
import { NewColumnModal } from "../components/ui/NewColumnModal.tsx"
import {DiscoveryModal} from "@/components/ui/DiscoveryModal.tsx";

interface DashboardDataResponse {
    columns: ColumnItem[]
    links: CardLinkItem[]
}

export function Dashboard() {
    const navigate = useNavigate()
    const [isEditMode, setIsEditMode] = React.useState(false)
    const [columns, setColumns] = React.useState<ColumnItem[]>([])
    const [items, setItems] = React.useState<CardLinkItem[]>([])

    // Status map state: { [linkId]: LinkStatusResponse }
    const [statuses, setStatuses] = React.useState<Record<number, LinkStatusResponse>>({})

    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [isNewModalOpen, setIsNewModalOpen] = React.useState(false)
    const [isNewColumnModalOpen, setIsNewColumnModalOpen] = React.useState(false)


    // 1. Fetch initial dashboard layout & links
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

    // 2. Poll the monitoring endpoint periodically (e.g., every 10 seconds)
    React.useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await dataApi.get<Record<number, LinkStatusResponse>>(`/status`)
                setStatuses(response.data)
            } catch (err) {
                console.error("Failed to fetch link statuses:", err)
            }
        }

        // Fetch immediately on mount, then set interval
        fetchStatuses()
        const intervalId = setInterval(fetchStatuses, 10000) // 10 seconds

        return () => clearInterval(intervalId) // Cleanup on unmount
    }, [])

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
        // Also cleanup status map entry if desired
        setStatuses((prev) => {
            const copy = { ...prev }
            delete copy[deletedId]
            return copy
        })
    }

    const handleColumnCreated = (newColumn: ColumnItem) => {
        setColumns((prevColumns) => [...prevColumns, newColumn])
    }

    const handleBatchSave = async (payload: BatchSavePayload) => {
        try {
            const requestBody = {
                columnDtoList: payload.columns,
                moveRequestList: payload.moves
            };

            const response = await dataApi.patch<DashboardDataResponse>('/links/batchsave', requestBody);

            setColumns(response.data.columns);
            setItems(response.data.links);

            console.log("Batch save & state sync successful!");

        } catch (err) {
            console.error("Failed to execute batch save:", err);
        } finally {
            setIsEditMode(false);
        }
    }

    const handleDeleteColumn = async (columnId: number) => {
        try {
            await dataApi.delete(`/column/${columnId}`);

            setColumns(prev => prev.filter(col => col.id !== columnId));
            setItems(prev => prev.filter(item => item.column !== columnId));

            console.log("Column " + columnId + " and its links deleted");

        } catch (err) {
            console.error("Failed to delete column:", err);
        }
    }


    const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = React.useState(false)
    const [discoveredLinks, setDiscoveredLinks] = React.useState<CardLinkItem[]>([])
    const [isDiscovering, setIsDiscovering] = React.useState(false)

    const handleDiscovery = async () => {
        try {
            setIsDiscovering(true)
            setIsDiscoveryModalOpen(true) // Open modal immediately to show loader

            const response = await dataApi.get<Array<CardLinkItem>>(`/discover`)
            setDiscoveredLinks(response.data)
            setError(null)
        } catch (err: any) {
            console.error("Failed to fetch discovered links:", err)
            // handle auth/errors...
        } finally {
            setIsDiscovering(false)
        }
    }

    return (
        <>
            <TopBar
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                onOpenNewModal={() => setIsNewModalOpen(true)}
                onOpenNewColumn={() => setIsNewColumnModalOpen(true)}
                onDiscover={handleDiscovery}
                isDiscovering={isDiscovering}
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
                statuses={statuses} // <-- Passed the status map down here!
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

            <DiscoveryModal
                isOpen={isDiscoveryModalOpen}
                onClose={() => setIsDiscoveryModalOpen(false)}
                isDiscovering={isDiscovering}
                discoveredLinks={discoveredLinks}
                // onImportLink={(link) => {
                //     // Optional: handle importing a link to your dashboard items state
                //     console.log("Importing link:", link)
                // }}
            />
        </>
    )
}