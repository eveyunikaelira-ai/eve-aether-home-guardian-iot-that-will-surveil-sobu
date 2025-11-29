export interface RoomState {
  room: string;
  occupied: boolean;
  door_open: boolean;
  window_open: boolean;
  temperature?: number;
  humidity?: number;
  air_quality?: number;
  last_seen_at?: string;
  last_alert_at?: string | null;
}

export interface FridgeState {
  room: string;
  summary?: string;
  health_score?: number;
  items?: Record<string, string[]> | string[];
  last_checked_at?: string;
}

export interface OccupantMetric {
  person: string;
  metric_type: string;
  weight_kg?: number;
  captured_at?: string;
  source?: string;
}
