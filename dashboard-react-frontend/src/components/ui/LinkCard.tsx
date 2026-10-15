import * as React from "react"
import { cn } from "@/lib/utils"
import { Edit3, Trash2 } from "lucide-react"

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
  onUpdate: (id: string, updatedData: any) => void // Pass this down from grid
}

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
  className,
  ...props
}: LinkCardProps) {

  const [isModalOpen, setIsModalOpen] = React.useState(false)

  return (
    <>
      <div
        className={cn(
          "group flex flex-col rounded-lg bg-card border border-border/40 hover:-translate-y-0.5 hover:border-border-hover hover:ring-1 hover:ring-primary/50",
          className
        )}
        {...props}
      >
        {/* 1. Main Link Area (Stays on top, full width) */}
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

        {/* 2. Edit & Delete Buttons using the component's variant/size props */}
        {isEditMode && (
          <div className="flex items-center justify-end px-5 py-3 gap-2 border-t border-border/40 animate-in fade-in duration-200">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setIsModalOpen(true) // Open this card's modal
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                console.log(`Delete link ${id}`)
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Render the EditModal, controlled by this card's local state */}
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