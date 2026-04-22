export type CalendarEventType = "record" | "edit" | "publish" | "custom";

export interface CalendarEvent {
  id: number;
  title: string;
  event_type: CalendarEventType;
  scheduled_for: string;
  project_id: number | null;
  notes: string | null;
  recurrence_rule: string | null;
  created_at: string;
}

export interface CalendarEventCreate {
  title: string;
  event_type: CalendarEventType;
  scheduled_for: string;
  project_id?: number | null;
  notes?: string | null;
  recurrence_rule?: string | null;
}

export interface CalendarEventUpdate {
  title?: string;
  event_type?: CalendarEventType;
  scheduled_for?: string;
  project_id?: number | null;
  notes?: string | null;
  recurrence_rule?: string | null;
}
