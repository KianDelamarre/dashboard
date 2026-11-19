import * as React from "react"
import { cn } from "@/lib/utils"
import { ExternalLink, Globe, Home } from "lucide-react"

import { type CardLinkItem } from "@/models/CardLinkItem.tsx"
import { STATUS_CONFIG, type LinkStatusResponse, StatusState } from "@/models/LinkStatusResponse.tsx"

function StatusBadge({ type, statusState }: { type: "Local" | "Remote"; statusState?: StatusState }) {
    const currentStatus = statusState || StatusState.UNDEFINED
    const config = STATUS_CONFIG[currentStatus]

    if (currentStatus === StatusState.UNDEFINED) {
        return <div className="w-2.5 h-2.5" />
    }

    return (
        <div className="relative flex items-center justify-center w-2.5 h-2.5" title={`${type}: ${config.label}`}>
            {currentStatus === StatusState.ONLINE && (
                <span className="absolute animate-ping duration-[4s] inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            )}
            <div className={cn("w-2.5 h-2.5 rounded-full transition-colors relative", config.bgClass)} />
        </div>
    )
}

interface LinkDetailsProps extends Omit<React.ComponentProps<"a">, "href"> {
    cardLinkData: CardLinkItem
    linkStatusResponse?: LinkStatusResponse
    openInNewTab?: boolean
}

export function LinkDetails({
                                cardLinkData,
                                linkStatusResponse,
                                openInNewTab = false,
                                className,
                                ...props
                            }: LinkDetailsProps) {
    return (
        <a
            href={cardLinkData.remoteUrl}
            target={openInNewTab ? "_blank" : "_self"}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
            className={cn(
                "group flex flex-col gap-3 rounded-lg bg-card border border-border/40 px-5 py-4 text-card-foreground shadow-sm transition-all duration-150 ease-out",
                "hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover hover:ring-1 hover:ring-primary/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                className
            )}
            {...props}
        >
            {/* Top Row: Icon, Name, Status Badges */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                    {cardLinkData.imgUrl && (
                        <img
                            src={cardLinkData.imgUrl}
                            alt={cardLinkData.name}
                            className="w-6 h-6 object-contain shrink-0"
                        />
                    )}
                    <span className="font-medium text-base text-card-foreground truncate">
                        {cardLinkData.name}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge type="Local" statusState={linkStatusResponse?.localStatus} />
                    <StatusBadge type="Remote" statusState={linkStatusResponse?.remoteStatus} />
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ml-1" />
                </div>
            </div>

            {/* Bottom Section: Local & Remote URLs */}
            <div className="flex flex-col gap-1.5 pt-2.5 border-t border-border/40 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 min-w-0" title={cardLinkData.remoteUrl}>
                    <Globe className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
                    <span className="font-medium text-muted-foreground/90 shrink-0">Remote:</span>
                    <span className="truncate font-mono text-[11px] text-foreground/85">
                        {cardLinkData.remoteUrl}
                    </span>
                </div>

                <div className="flex items-center gap-2 min-w-0" title={cardLinkData.localUrl || "Not set"}>
                    <Home className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
                    <span className="font-medium text-muted-foreground/90 shrink-0">Local:</span>
                    <span className="truncate font-mono text-[11px] text-foreground/85">
                        {cardLinkData.localUrl || "—"}
                    </span>
                </div>
            </div>
        </a>
    )
}