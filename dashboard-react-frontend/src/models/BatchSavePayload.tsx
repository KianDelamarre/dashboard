// Updated payload interface to include both column edits and card position moves
import {type ColumnItem } from "@/models/ColumnItem.tsx";
import { type MoveData } from "@/models/MoveData.tsx";

export interface BatchSavePayload {
    columns: ColumnItem[]
    moves: MoveData[]
}