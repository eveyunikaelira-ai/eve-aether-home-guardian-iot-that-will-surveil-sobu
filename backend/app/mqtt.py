import json
import logging
import threading
from datetime import datetime
from typing import Callable

import paho.mqtt.client as mqtt
from sqlalchemy.orm import Session

from .config import settings
from .models import Event, RoomState, Sensor
from .database import SessionLocal

logger = logging.getLogger(__name__)


MQTT_TOPICS = [
    ("home/+/mmwave", 0),
    ("home/+/pir", 0),
    ("home/+/door", 0),
    ("home/+/window", 0),
    ("home/+/env", 0),
    ("home/+/alert", 0),
]


def ensure_sensor(db: Session, sensor_id: str, room: str, sensor_type: str):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        sensor = Sensor(id=sensor_id, room=room, type=sensor_type, hw_id=sensor_id)
        db.add(sensor)
        db.commit()
    return sensor


def persist_event(db: Session, topic: str, payload: dict):
    try:
        parts = topic.split("/")
        _, room, sensor_type = parts[0], parts[1], parts[2]
        sensor_id = payload.get("sensor_id") or f"{room}-{sensor_type}"
        ensure_sensor(db, sensor_id, room, sensor_type)

        event = Event(sensor_id=sensor_id, event_type=sensor_type, payload_json=payload)
        db.add(event)

        room_state = db.query(RoomState).filter(RoomState.room == room).first()
        if not room_state:
            room_state = RoomState(room=room)
            db.add(room_state)
        room_state.last_seen_at = datetime.utcnow()

        if sensor_type in {"mmwave", "pir"}:
            room_state.occupied = bool(payload.get("occupied"))
        elif sensor_type in {"door", "window"}:
            is_open = bool(payload.get("open"))
            if sensor_type == "door":
                room_state.door_open = is_open
            else:
                room_state.window_open = is_open
        elif sensor_type == "env":
            room_state.temperature = payload.get("temperature")
            room_state.humidity = payload.get("humidity")
            room_state.air_quality = payload.get("air_quality")

        db.commit()
    except Exception:
        logger.exception("Failed to persist MQTT event")


def _on_connect(client: mqtt.Client, userdata, flags, rc):
    if rc == 0:
        logger.info("Connected to MQTT broker; subscribing to topics")
        for topic, qos in MQTT_TOPICS:
            client.subscribe(topic, qos=qos)
    else:
        logger.error("Failed to connect to MQTT broker with rc=%s", rc)


def _on_message(client: mqtt.Client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
    except json.JSONDecodeError:
        logger.warning("Received invalid JSON on topic %s", msg.topic)
        return

    db: Session = SessionLocal()
    try:
        persist_event(db, msg.topic, payload)
    finally:
        db.close()


def start_mqtt_background():
    if not settings.mqtt_enabled:
        logger.info("MQTT disabled by configuration")
        return None

    client = mqtt.Client()
    client.on_connect = _on_connect
    client.on_message = _on_message

    def run():
        try:
            client.connect(settings.mqtt_broker_host, settings.mqtt_broker_port, 60)
            client.loop_forever()
        except Exception:
            logger.exception("MQTT client stopped unexpectedly")

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
    return client
