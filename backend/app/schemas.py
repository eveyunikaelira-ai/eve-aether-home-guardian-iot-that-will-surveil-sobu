from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel


class RoomStateBase(BaseModel):
    room: str
    last_seen_at: Optional[datetime]
    occupied: bool = False
    door_open: bool = False
    window_open: bool = False
    temperature: Optional[float]
    humidity: Optional[float]
    air_quality: Optional[float]
    last_alert_at: Optional[datetime]

    class Config:
        orm_mode = True


class RoomStateList(BaseModel):
    rooms: List[RoomStateBase]


class FridgeStateBase(BaseModel):
    room: str
    last_checked_at: Optional[datetime]
    health_score: Optional[float]
    summary: Optional[str]
    items: Optional[Any]

    class Config:
        orm_mode = True


class FridgeStateList(BaseModel):
    fridges: List[FridgeStateBase]


class OccupantMetricBase(BaseModel):
    person: str
    metric_type: str
    weight_kg: Optional[float]
    captured_at: Optional[datetime]
    source: Optional[str]

    class Config:
        orm_mode = True


class OccupantMetricList(BaseModel):
    metrics: List[OccupantMetricBase]
