import * as React from "react"
import { cn } from "@/lib/utils"
import { Edit3, Trash2 } from "lucide-react"

import axios from "axios"

import { Button } from "./Button"
import { EditModal } from "./EditModel"

interface LinkCardProps extends React.ComponentProps<"div"> {
  id: string
  name: string
  localUrl: string
  remoteUrl: string
  imgUrl: string
  column: number
  row: number
  isEditMode: boolean
  onUpdate: (id: string, updatedData: any) => void
  onDelete: (id: string) => void // <-- Added delete callback prop
}

const API_URL = 'http://localhost:8080'

export function LinkCard({
  id,
  name,
  localUrl,
  remoteUrl,
  imgUrl,
  column,
  row,
  isEditMode,
  onUpdate,
  onDelete, // <-- Destructure delete callback
  className,
  ...props
}: LinkCardProps) {

  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false) // <-- Track deletion loading state

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // Optional confirmation prompt before deleting
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    setIsLoading(true)

    try {
      // Send DELETE request to your Spring Boot endpoint
      await axios.delete(`${API_URL}/link/${id}`)

      console.log(`Successfully deleted link ${id}`)

      // Notify parent grid to filter out this card instantly
      onDelete(id)

    } catch (error) {
      console.error("Failed to delete link:", error)
      alert("Failed to delete link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "group flex flex-col rounded-lg bg-card border border-border/40 hover:-translate-y-0.5 hover:border-border-hover hover:ring-1 hover:ring-primary/50",
          className
        )}
        {...props}
      >
        {/* 1. Main Link Area */}
        <a
          href={remoteUrl}
          target="_self"
          className="flex flex-row items-center px-5 py-4 rounded-lg justify-between w-full hover:opacity-80 transition-opacity 
         hover:bg-card-hover hover:border-border-hover hover:ring-1 hover:ring-primary/50 
        transition-all duration-150 ease-out shadow-sm text-card-foreground "
        >
          <div className="flex items-center gap-3.5">
            {imgUrl && (
              <img
                src={imgUrl}
                alt={name}
                className="w-6 h-6 object-contain"
              />
            )}
            <span className="font-medium text-base text-card-foreground transition-colors">
              {name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              id={`${localUrl}-status-local`}
              className="w-2 h-2 rounded-full bg-amber-400"
              title="Local Status"
            />
            <div
              id={`${remoteUrl}-status-remote`}
              className="w-2 h-2 rounded-full bg-amber-400"
              title="Remote Status"
            />
          </div>
        </a>

        {/* 2. Edit & Delete Buttons */}
        {isEditMode && (
          <div className="flex items-center justify-end px-5 py-3 gap-2 border-t border-border/40 animate-in fade-in duration-200">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault()
                setIsModalOpen(true)
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isLoading} // Prevent double-clicks while deleting
              onClick={handleDelete} // <-- Hooked up handleDelete here
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}
      </div>

      {/* Render the EditModal */}
      <EditModal
        id={id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        name={name}
        remoteUrl={remoteUrl}
        localUrl={localUrl}
        imgUrl={imgUrl}
        row={row}
        column={column}
        onSaveSuccess={(updatedData) => onUpdate(id, updatedData)}
      />
    </>
  )
}