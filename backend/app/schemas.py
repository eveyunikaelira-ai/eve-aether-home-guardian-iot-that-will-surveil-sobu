from datetime import datetime
from typing import Optional, List
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
