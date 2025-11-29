import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RoomCard } from './RoomCard';
import { FridgeState, OccupantMetric, RoomState } from './types';

const dummyRooms: RoomState[] = [
  { room: 'livingroom', occupied: true, door_open: false, window_open: false, temperature: 21.5, humidity: 42, air_quality: 10 },
  { room: 'bedroom', occupied: false, door_open: false, window_open: true, temperature: 20.2, humidity: 40, air_quality: 12 },
  { room: 'kitchen', occupied: false, door_open: true, window_open: false, temperature: 22.6, humidity: 46, air_quality: 14 }
];

const dummyFridge: FridgeState = {
  room: 'kitchen',
  summary: 'Fresh greens, fruit, and Luminora rolls inside',
  health_score: 0.82,
  items: { healthy: ['salad', 'berries', 'Luminora rolls'], less_healthy: ['soda can'] }
};

const dummyMetrics: OccupantMetric[] = [
  { person: 'sobu', metric_type: 'weight', weight_kg: 68.5, captured_at: new Date().toISOString(), source: 'demo-scale' }
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
  const [fridge, setFridge] = useState<FridgeState>(dummyFridge);
  const [metrics, setMetrics] = useState<OccupantMetric[]>(dummyMetrics);

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

    axios
      .get('/api/v1/fridge')
      .then((res) => {
        if (res.data?.fridges?.length) {
          setFridge(res.data.fridges[0]);
        }
      })
      .catch(() => {
        // keep dummy data
      });

    axios
      .get('/api/v1/occupants/sobu/weight')
      .then((res) => {
        if (res.data?.metrics?.length) {
          setMetrics(res.data.metrics);
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
  const latestWeight = metrics.find((m) => m.metric_type === 'weight');

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

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
          marginBottom: '14px'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: '0 10px 40px rgba(15, 23, 42, 0.08)'
          }}
        >
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Kitchen fridge snapshot</div>
          <div style={{ color: '#4c5674', fontSize: '14px', marginBottom: '6px' }}>{fridge.summary}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1c2340', fontWeight: 600 }}>
            <span>Health score</span>
            <span>{fridge.health_score ? `${Math.round(fridge.health_score * 100)}%` : 'N/A'}</span>
          </div>
          {fridge.items && typeof fridge.items === 'object' && !Array.isArray(fridge.items) ? (
            <div style={{ marginTop: '8px', color: '#4c5674', fontSize: '13px' }}>
              <div>Healthy: {(fridge.items as Record<string, string[]>).healthy?.join(', ') || 'n/a'}</div>
              <div>Less healthy: {(fridge.items as Record<string, string[]>).less_healthy?.join(', ') || 'n/a'}</div>
            </div>
          ) : null}
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: '0 10px 40px rgba(15, 23, 42, 0.08)'
          }}
        >
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Body metrics (opt-in)</div>
          <div style={{ color: '#4c5674', fontSize: '14px', marginBottom: '6px' }}>
            Shows latest Xiaomi Body Composition Scale reading kept on the local network.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1c2340', fontWeight: 600 }}>
            <span>Weight</span>
            <span>{latestWeight?.weight_kg ? `${latestWeight.weight_kg.toFixed(1)} kg` : 'N/A'}</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
            {latestWeight?.captured_at ? `Updated ${new Date(latestWeight.captured_at).toLocaleString()}` : 'Waiting for scale data'}
          </div>
        </div>
      </section>

      <main style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {rooms.map((room) => (
          <RoomCard room={room} key={room.room} />
        ))}
      </main>
    </div>
  );
};

export default App;
