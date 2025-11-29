import React from 'react';
import { RoomState } from './types';

interface Props {
  room: RoomState;
}

const pill = (label: string, active: boolean, color: string) => (
  <span
    style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      backgroundColor: active ? color : '#f0f4f8',
      color: active ? '#0b1021' : '#4c5674',
      marginRight: '8px',
      fontSize: '12px'
    }}
  >
    {label}
  </span>
);

export const RoomCard: React.FC<Props> = ({ room }) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: '0 6px 20px rgba(12, 10, 51, 0.08)',
        minWidth: '260px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#1c2340' }}>{room.room}</h3>
        {pill(room.occupied ? 'Occupied' : 'Empty', room.occupied, room.occupied ? '#c7e7ff' : '#e6e7ff')}
      </div>
      <div style={{ marginTop: '12px', color: '#4c5674' }}>
        <div>Door: {room.door_open ? 'Open' : 'Closed'} · Window: {room.window_open ? 'Open' : 'Closed'}</div>
        <div style={{ marginTop: '6px' }}>
          Temp: {room.temperature ?? '—'}°C · Humidity: {room.humidity ?? '—'}% · Air Q: {room.air_quality ?? '—'}
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c7498' }}>
          Last seen: {room.last_seen_at ? new Date(room.last_seen_at).toLocaleString() : 'n/a'}
        </div>
      </div>
    </div>
  );
};
