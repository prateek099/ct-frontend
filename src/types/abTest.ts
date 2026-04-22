export type ABStatus = "running" | "completed" | "cancelled";
export type ABWinner = "a" | "b";

export interface ABTest {
  id: number;
  project_id: number;
  title_a: string;
  title_b: string;
  status: ABStatus;
  winner: ABWinner | null;
  notes: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface ABTestCreate {
  project_id: number;
  title_a: string;
  title_b: string;
  notes?: string | null;
  ends_at?: string | null;
}

export interface ABTestUpdate {
  title_a?: string;
  title_b?: string;
  status?: ABStatus;
  winner?: ABWinner;
  notes?: string | null;
  ends_at?: string | null;
}
