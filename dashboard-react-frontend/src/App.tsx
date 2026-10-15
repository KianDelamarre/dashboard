import * as React from "react"
import axios from "axios"
import { TopBar } from "./components/ui/TopBar"
import { LinkCardGrid } from "./components/ui/LinkCardGrid"
import { NewLinkModal } from "./components/ui/NewLinkModal"

interface CardLinkItem {
  id: number
  name: string
  localUrl: string
  remoteUrl: string
  imgUrl: string
  column: number
  row: number
}

const API_URL = 'http://localhost:8080'

export default function App() {
  const [isEditMode, setIsEditMode] = React.useState(false)

  // 1. Explicitly type items so TypeScript knows what it holds
  const [items, setItems] = React.useState<CardLinkItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Global modal state lives right here in App!
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false)

  // Fetch items at the root level
  React.useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get<CardLinkItem[]>(`${API_URL}/links`)
        setItems(response.data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch links:", err)
        setError("Could not connect to backend server.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchLinks()
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

  return (
    <>
      {/* 1. TopBar triggers the modal via callback */}
      <TopBar
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onOpenNewModal={() => setIsNewModalOpen(true)}
      />

      {/* 2. Grid displays items and handles card-level updates via props */}

      <LinkCardGrid
        items={items}
        isLoading={isLoading}
        error={error}
        isEditMode={isEditMode}
        onUpdateLink={handleLinkUpdated}
        onDeleteLink={handleLinkDeleted}
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