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
