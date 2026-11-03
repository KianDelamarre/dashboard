import * as React from "react"
import { cn } from "@/lib/utils"
import { Edit3, Trash2 } from "lucide-react"

import { dataApi } from "../../api/client.tsx"

import { Button } from "./Button"
import { EditModal } from "./EditModel"
import { type CardLinkItem } from "@/models/CardLinkItem.tsx";
import { STATUS_CONFIG, type LinkStatusResponse, StatusState } from "@/models/LinkStatusResponse.tsx";

// Helper component for rendering status dots with tooltips (default cursor)
function StatusBadge({ type, statusState }: { type: "Local" | "Remote"; statusState?: StatusState }) {
  const currentStatus = statusState || StatusState.UNDEFINED;
  const config = STATUS_CONFIG[currentStatus];

  return (
      <div
          className={cn("w-2.5 h-2.5 rounded-full transition-colors", config.bgClass)}
          title={`${type}: ${config.label}`}
      />
  );
}

interface LinkCardProps extends React.ComponentProps<"div"> {
  cardLinkData: CardLinkItem
  isEditMode: boolean
  onUpdate: (id: number, updatedData: any) => void
  onDelete: (id: number) => void
  linkStatusResponse?: LinkStatusResponse
}

export function LinkCard({
                           cardLinkData,
                           isEditMode,
                           onUpdate,
                           onDelete,
                           linkStatusResponse,
                           className,
                           ...props
                         }: LinkCardProps) {

  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // Fixed: changed 'name' to 'cardLinkData.name'
    if (!window.confirm(`Are you sure you want to delete "${cardLinkData.name}"?`)) {
      return
    }

    setIsLoading(true)

    try {
      await dataApi.delete(`/link/${cardLinkData.id}`)
      console.log(`Successfully deleted link ${cardLinkData.id}`)
      onDelete(cardLinkData.id)
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
              href={cardLinkData.remoteUrl}
              target="_self"
              className="flex flex-row items-center px-5 py-4 rounded-lg justify-between w-full hover:opacity-80 transition-opacity
          hover:bg-card-hover hover:border-border-hover hover:ring-1 hover:ring-primary/50
          transition-all duration-150 ease-out shadow-sm text-card-foreground "
          >
            <div className="flex items-center gap-3.5">
              {cardLinkData.imgUrl && (
                  <img
                      src={cardLinkData.imgUrl}
                      alt={cardLinkData.name}
                      className="w-6 h-6 object-contain"
                  />
              )}
              <span className="font-medium text-base text-card-foreground transition-colors">
              {cardLinkData.name}
            </span>
            </div>

            {/* Dynamic Status Badges */}
            <div className="flex items-center gap-2">
              <StatusBadge type="Local" statusState={linkStatusResponse?.localStatus} />
              <StatusBadge type="Remote" statusState={linkStatusResponse?.remoteStatus} />
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
                    disabled={isLoading}
                    onClick={handleDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isLoading ? "Deleting..." : "Delete"}
                </Button>
              </div>
          )}
        </div>

        {/* Render the EditModal */}
        <EditModal
            id={cardLinkData.id}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            name={cardLinkData.name}
            remoteUrl={cardLinkData.remoteUrl}
            localUrl={cardLinkData.localUrl}
            imgUrl={cardLinkData.imgUrl}
            row={cardLinkData.row}
            column={cardLinkData.column}
            onSaveSuccess={(updatedData) => onUpdate(cardLinkData.id, updatedData)}
        />
      </>
  )
}