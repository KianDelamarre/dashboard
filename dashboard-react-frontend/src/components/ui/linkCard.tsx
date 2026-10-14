import * as React from "react"
import { cn } from "@/lib/utils" // Updated to standard alias path

interface LinkCardProps extends React.ComponentProps<"a"> {
  id: string
  name: string
  localUrl: string
  remoteUrl: string
  imgUrl: string
  column: string
  row: number
}

export function LinkCard({
  id,
  name,
  localUrl,
  remoteUrl,
  imgUrl,
  column,
  row,
  className,
  ...props
}: LinkCardProps) {
  return (
    <a
      href={remoteUrl}
      target="_self"
      className={cn(
        // Increased padding from p-3 to p-4 for a larger card footprint
        "group flex items-center justify-between px-5 py-4 rounded-lg bg-card border border-border/40 " +
        "hover:-translate-y-0.5 hover:bg-card-hover hover:border-border-hover hover:ring-1 hover:ring-primary/50 " +
        "transition-all duration-150 ease-out shadow-sm text-card-foreground",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3.5">
        {imgUrl && (
          <img
            src={imgUrl}
            alt={name}
            // Increased icon size from w-5 h-5 to w-6 h-6
            className="w-6 h-6 object-contain"
          />
        )}
        {/* Increased text size from text-sm to text-base */}
        <span className="font-medium text-base text-card-foreground transition-colors">
          {name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Slightly scaled up status dots to match */}
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
  )
}