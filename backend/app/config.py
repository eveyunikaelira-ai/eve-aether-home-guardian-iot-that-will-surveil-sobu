from pydantic import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    app_name: str = "Eve Aether Home Guardian"
    database_url: str = f"sqlite:///{Path('/data/app.db')}"
    mqtt_broker_host: str = "mqtt"
    mqtt_broker_port: int = 1883
    mqtt_enabled: bool = True
    seed_demo_data: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
