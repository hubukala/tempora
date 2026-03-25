// ============================================
// TEMPORA — Shared Types
// ============================================
// Used by both `apps/web` and `apps/api`

// ── API Response wrapper ─────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// ── Task types ───────────────────────────────

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskReorderPayload {
  taskId: string;
  newStatus: TaskStatus;
  newPosition: number;
}

// ── Time Entry types ─────────────────────────

export interface TimerState {
  isRunning: boolean;
  startTime: string | null;
  elapsed: number; // seconds
  projectId: string | null;
  taskId: string | null;
  description: string;
}

export interface CreateTimeEntryInput {
  description?: string;
  startTime: string;
  endTime: string;
  projectId: string;
  taskId?: string;
}

// ── Invoice types ────────────────────────────

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

// ── WebSocket events ─────────────────────────

export interface WsEvents {
  "task:moved": TaskReorderPayload;
  "task:created": { projectId: string };
  "task:updated": { taskId: string };
  "timer:started": { userId: string; projectId: string };
  "timer:stopped": { userId: string };
}
