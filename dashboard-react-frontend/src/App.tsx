import * as React from "react"
import axios from "axios"
import { TopBar } from "./components/ui/TopBar"
import { LinkCardGrid } from "./components/ui/LinkCardGrid"
import { NewLinkModal } from "./components/ui/NewLinkModal"

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

// Matches your backend DashboardDataResponse DTO
interface DashboardDataResponse {
  columns: ColumnItem[]
  links: CardLinkItem[]
}

const API_URL = 'http://localhost:8080'

export default function App() {
  const [isEditMode, setIsEditMode] = React.useState(false)

  // State for columns and links
  const [columns, setColumns] = React.useState<ColumnItem[]>([])
  const [items, setItems] = React.useState<CardLinkItem[]>([])

  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Global modal state lives right here in App!
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false)

  // Fetch dashboard data (columns + links) at the root level
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // Updated to match your new endpoint returning the wrapper DTO
        const response = await axios.get<DashboardDataResponse>(`${API_URL}/links`)
        setColumns(response.data.columns)
        setItems(response.data.links)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Could not connect to backend server.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  // Handler to update an existing link in state
  const handleLinkUpdated = (id: string, updatedData: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === Number(id) ? { ...item, ...updatedData } : item
      )
    )
  }

  // Handler to append a newly created link into the global state
  const handleLinkCreated = (newLink: CardLinkItem) => {
    setItems((prevItems) => [...prevItems, newLink])
  }

  const handleLinkDeleted = (deletedId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== Number(deletedId)))
  }

  const [batchMoves, setBatchMoves] = React.useState<any[]>([])

  // Called whenever a card is dragged or reordered via LinkCardGrid
  const handleBatchSave = async (moves: any[]) => {
    if (moves.length > 0) {
      try {
        await axios.patch(`${API_URL}/links/batchmove`, moves)
        console.log("Batch move successful!")
      } catch (err) {
        console.error("Failed to execute batch move:", err)
      }
    }
    setIsEditMode(false)
  }

  // Triggered when the user clicks "Save" in the TopBar
  const handleSaveChanges = async () => {
    if (batchMoves.length > 0) {
      try {
        await axios.patch(`${API_URL}/links/batchmove`, batchMoves)
        console.log("Batch move successful!")
        setBatchMoves([]) // Clear changes after saving
      } catch (err) {
        console.error("Failed to execute batch move:", err)
      }
    }
    setIsEditMode(false)
  }

  return (
    <>
      {/* 1. TopBar triggers the modal via callback */}
      <TopBar
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onSave={handleSaveChanges}
      />

      {/* 2. Grid now receives both the dynamic columns and links */}
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

      {/* 3. NewLinkModal rendered cleanly at the root App level */}
      <NewLinkModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onLinkCreated={handleLinkCreated}
      />
    </>
  )
}