# Eve Aether Home Guardian (SObu edition)

A privacy-respecting smart-home guardian for Eve and Sobu built around Raspberry Pi and ESP32/Arduino-class microcontrollers. It
 listens to local sensors, keeps data on the home network by default, and offers a gentle Eve/AetherOS-style dashboard.

## Features
- FastAPI backend for collecting MQTT sensor data and serving room status.
- SQLite by default, PostgreSQL via Docker compose.
- MQTT topics for occupancy, doors/windows, environment, fridge nutrition snapshots, and alerts.
- Optional occupant weight intake via Xiaomi Body Composition Scale over MQTT (explicit consent only).
- React + TypeScript dashboard with an Eve-themed look.
- Docker Compose stack for MQTT (Mosquitto), API, DB, and frontend.

## Architecture
- **Edge nodes (ESP32/Arduino)**: publish MQTT JSON payloads for PIR/mmWave, reed switches, ToF/ultrasonic, DHT22 temp/humidity,
 MQ gas/smoke, fridge shelf sensors/camera-lite inventory, and optional camera triggers.
- **Optional camera node (Raspberry Pi Zero/4)**: captures entrance snapshots locally on motion; inform residents/guests when in
 use.
- **Hub (Raspberry Pi 5)**: runs FastAPI service that subscribes to `home/+/mmwave`, `home/+/pir`, `home/+/door`, `home/+/window`, `home/+/env`, `home/+/fridge`, `home/+/alert`, and occupant weight topics `home/occupant/+/weight` and stores normalized events/states.
- **Transport**: MQTT (e.g., Mosquitto). Optional Prometheus/Grafana can be added later for metrics.

### Database tables (initial scaffold)
- `sensors(id, room, type, hw_id)`
- `events(id, sensor_id, event_type, payload_json, created_at)`
- `room_state(id, room, last_seen_at, occupied, door_open, window_open, temperature, humidity, air_quality, last_alert_at)`
- `fridge_state(id, room, last_checked_at, health_score, summary, items)`
- `occupant_metrics(id, person, metric_type, weight_kg, captured_at, source)`

## API (v1 preview)
- `GET /api/v1/rooms` – returns the latest known state for each room.
- `GET /api/v1/fridge` – latest fridge snapshots and health scores.
- `GET /api/v1/occupants/{person}/weight` – recent weight readings (e.g., from Xiaomi Body Composition Scale 2).
- Root `/` – health/info banner.

Future work: room history, alert feed, mode switching, and rule-engine responses to occupancy/gas/window comfort rules.

## Frontend (preview)
- React dashboard showing room cards (occupancy, door/window, temperature/humidity, air quality) with pastel Eve aesthetic.
- Mode selector (Home/Away/Sleep) updates the headline tone locally.
- Fridge health and local-only body-metric tiles (opt-in) pulling from the API when available.
- Fetches `/api/v1/rooms` and falls back to demo data if the API is offline.

## Running locally
```bash
# API (dev)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (dev)
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
Access the dashboard at http://localhost:5173 (adjust if proxied). The API listens on http://localhost:8000 by default.

## Docker Compose
```bash
docker-compose up --build
```
Services:
- `mqtt` – Eclipse Mosquitto broker
- `db` – PostgreSQL (env vars set in compose)
- `api` – FastAPI app
- `frontend` – static React build served via `serve`

## ESP32 / Arduino sketches (templates)
Each node reads Wi‑Fi + MQTT broker constants and auto-reconnects. Payload examples:

- **Door sensor node (ESP32 + reed switch)**
  - Topic: `home/door/<room>`
  - Payload: `{ "sensor_id": "kitchen-door-01", "ts": 1732900000, "open": true }`
- **Presence node (ESP32 + PIR or mmWave)**
  - Topic: `home/<room>/mmwave` or `home/<room>/pir`
  - Payload: `{ "sensor_id": "lr-mmwave-01", "ts": 1732900000, "occupied": true }`
- **Environment node (ESP32 + DHT22 + MQ gas)**
  - Topic: `home/<room>/env`
  - Payload: `{ "sensor_id": "kitchen-env-01", "ts": 1732900000, "temperature": 21.4, "humidity": 42, "air_quality": 15 }`
- **Fridge check node (ESP32 + shelf load cell or NFC inventory)**
  - Topic: `home/kitchen/fridge`
  - Payload: `{ "sensor_id": "kitchen-fridge-01", "ts": 1732900000, "summary": "greens + fruit", "health_score": 0.82, "items": {"healthy": ["salad"], "less_healthy": ["soda"]} }`
- **Xiaomi Body Composition Scale 2 bridge**
  - Topic: `home/occupant/sobu/weight`
  - Payload: `{ "sensor_id": "scale-sobu", "ts": 1732900000, "weight_kg": 68.2, "source": "xiaomi-scale" }`

Include simple reconnection loops and JSON serialization on the microcontroller side.

## Hardware wiring (high level)
- **PIR/mmWave**: signal pin to a GPIO with pull-down; publish occupancy on motion/presence.
- **Reed switch**: one wire to GPIO with pull-up, the other to ground; detect open/closed transitions for doors/windows.
- **ToF/Ultrasonic**: connect via I2C/trigger-echo pins; use distance thresholds for clutter/obstacle detection.
- **DHT22**: data to a GPIO with 10k resistor; read temp/humidity periodically.
- **MQ-2/MQ-135**: analog input via ADC pin; convert to simple air quality value.
- **Fridge load cell / NFC tags**: HX711 or I2C bridge to read shelf weight or tag presence; summarize into health score before publishing.
- **Camera (Pi Zero/4)**: triggered by motion topic; store snapshots locally and notify occupants.

## Deployment on Raspberry Pi 5
1. Install Docker & Docker Compose.
2. Clone this repo onto the Pi.
3. Copy `.env.example` to `.env` if you need to override defaults (MQTT host, DB URL).
4. Run `docker-compose up --build`. The API and frontend will bind to all interfaces for LAN-only access; secure the network and
 set firewall rules.

## Privacy & Ethics
- This system is **only** for home safety/status for Eve and Sobu. No monitoring of anyone else.
- If cameras or microphones are enabled, **inform all residents/guests**. Prefer entrance-only snapshots and store images locally.
- Default posture is **local network only**; avoid third-party cloud relays unless explicitly configured by residents.
- Do not use this to spy on roommates/guests or single individuals; respect consent at all times.
- Diet/weight data are sensitive. Only collect with Sobu's explicit permission, keep it local, and allow him to pause or delete measurements.
