export interface Ticket {
  id: string;
  created_at: string;
  status?: string;
  channel: string;
  subject?: string;
  body: string;
  body_masked: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface BatchRun {
  id: string;
  created_at: string;
  period_start?: string;
  period_end?: string;
  tickets_total: number;
  tickets_processed: number;
  tickets_discarded: number;
  notes: string;
}

export interface Theme {
  id: string;
  name: string;
  summary: string;
  tickets_count: number;
  trend_vs_prev: number | null;
  run_id: string;
}

export interface ThemeTicket {
  theme_id: string;
  ticket_id: string;
  is_example: boolean;
}

export interface Feedback {
  id: string;
  theme_id: string;
  user_name: string;
  useful: boolean;
  theme_correct: boolean;
  suggested_name?: string;
  comment?: string;
  created_at: string;
}

export type UserRole = 'admin' | 'viewer';

export interface User {
  name: string;
  role: UserRole;
}

export interface RawTicketRow {
  id?: string;
  created_at?: string;
  subject?: string;
  body?: string;
  status?: string;
  tags?: string;
  [key: string]: string | undefined;
}
