from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String, primary_key=True, index=True)
    room = Column(String, index=True)
    type = Column(String, index=True)
    hw_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    event_type = Column(String, index=True)
    payload_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class RoomState(Base):
    __tablename__ = "room_state"

    id = Column(Integer, primary_key=True, index=True)
    room = Column(String, index=True, unique=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    occupied = Column(Boolean, default=False)
    door_open = Column(Boolean, default=False)
    window_open = Column(Boolean, default=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    air_quality = Column(Float, nullable=True)
    last_alert_at = Column(DateTime, nullable=True)
