// 1. Define the union type for your types/autocomplete
export type StatusState = "ONLINE" | "UNREACHABLE" | "UNDEFINED";

// 2. Runtime helper object for checks
export const StatusState = {
    ONLINE: "ONLINE",
    UNREACHABLE: "UNREACHABLE",
    UNDEFINED: "UNDEFINED",
} as const;

export interface LinkStatusResponse {
    linkId: number;
    localStatus: StatusState;
    remoteStatus: StatusState;
}

// 3. Define the config shape that was missing
export interface StatusStyleConfig {
    bgClass: string;
    textClass: string;
    label: string;
}

// 4. The lookup configuration map
export const STATUS_CONFIG: Record<StatusState, StatusStyleConfig> = {
    [StatusState.ONLINE]: {
        bgClass: "bg-green-500",
        textClass: "text-green-700",
        label: "Online"
    },
    [StatusState.UNREACHABLE]: {
        bgClass: "bg-red-500",
        textClass: "text-red-700",
        label: "Unreachable"
    },
    [StatusState.UNDEFINED]: {
        bgClass: "bg-card",
        textClass: "text-gray-500",
        label: "Not Configured"
    }
};