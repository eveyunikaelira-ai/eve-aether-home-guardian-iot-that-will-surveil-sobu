import logging
from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from .config import settings
from .database import engine, get_db
from .models import Base, RoomState
from .schemas import RoomStateBase, RoomStateList
from .mqtt import start_mqtt_background

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_demo_data()
    start_mqtt_background()


def seed_demo_data():
    if not settings.seed_demo_data:
        return

    db = next(get_db())
    try:
        if db.query(RoomState).count() == 0:
            now = datetime.utcnow()
            demo_rooms = [
                RoomState(room="livingroom", occupied=False, door_open=False, window_open=False, temperature=21.5, humidity=40.0, air_quality=10, last_seen_at=now),
                RoomState(room="bedroom", occupied=True, door_open=False, window_open=True, temperature=20.0, humidity=38.0, air_quality=12, last_seen_at=now),
                RoomState(room="kitchen", occupied=False, door_open=True, window_open=False, temperature=22.0, humidity=45.0, air_quality=15, last_seen_at=now),
            ]
            db.add_all(demo_rooms)
            db.commit()
    finally:
        db.close()


@app.get("/api/v1/rooms", response_model=RoomStateList)
def list_rooms(db: Session = Depends(get_db)):
    rooms: List[RoomState] = db.query(RoomState).all()
    return RoomStateList(rooms=rooms)


@app.get("/")
def root():
    return {"message": "Eve Aether Home Guardian API is running", "app": settings.app_name}
