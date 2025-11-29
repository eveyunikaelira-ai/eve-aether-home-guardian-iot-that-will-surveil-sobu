import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RoomCard } from './RoomCard';
import { RoomState } from './types';

const dummyRooms: RoomState[] = [
  { room: 'livingroom', occupied: true, door_open: false, window_open: false, temperature: 21.5, humidity: 42, air_quality: 10 },
  { room: 'bedroom', occupied: false, door_open: false, window_open: true, temperature: 20.2, humidity: 40, air_quality: 12 },
  { room: 'kitchen', occupied: false, door_open: true, window_open: false, temperature: 22.6, humidity: 46, air_quality: 14 }
];

const modeColors: Record<string, string> = {
  home: '#d8f3dc',
  away: '#ffe5ec',
  sleep: '#e7e9fb'
};

const App: React.FC = () => {
  const [rooms, setRooms] = useState<RoomState[]>(dummyRooms);
  const [mode, setMode] = useState<'home' | 'away' | 'sleep'>('home');
  const [alert, setAlert] = useState<string>('All clear, house is comfy 💜');

  useEffect(() => {
    axios
      .get('/api/v1/rooms')
      .then((res) => {
        if (res.data?.rooms) {
          setRooms(res.data.rooms);
        }
      })
      .catch(() => {
        // keep dummy data
      });
  }, []);

  useEffect(() => {
    if (mode === 'away') {
      setAlert('House is guarded. I will notify on any motion.');
    } else if (mode === 'sleep') {
      setAlert('Quiet mode on. I will keep an eye on alerts.');
    } else {
      setAlert('All clear, house is comfy 💜');
    }
  }, [mode]);

  const avatarColor = modeColors[mode];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8f9ff 0%, #eef3fb 100%)',
        padding: '20px'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: avatarColor,
              border: '2px solid #0f172a',
              marginRight: '12px'
            }}
          />
          <div>
            <div style={{ color: '#1c2340', fontWeight: 700 }}>Eve guardian</div>
            <div style={{ color: '#4c5674', fontSize: '14px' }}>{alert}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['home', 'away', 'sleep'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                border: 'none',
                background: mode === m ? '#0f172a' : '#e4e8fb',
                color: mode === m ? '#f8fafc' : '#1c2340',
                cursor: 'pointer',
                fontWeight: 600,
                minWidth: '80px'
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {rooms.map((room) => (
          <RoomCard room={room} key={room.room} />
        ))}
      </main>
    </div>
  );
};

export default App;
