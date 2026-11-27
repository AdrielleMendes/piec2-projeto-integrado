from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = BASE_DIR.parent
load_dotenv(PROJECT_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


DATABASE_PATH = Path(os.getenv("DATABASE_PATH", str(BASE_DIR / "data" / "nexguard.db")))
MODEL_DIR = Path(os.getenv("MODEL_DIR", str(BASE_DIR / "models")))
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")
DEVICE_API_KEY = os.getenv("DEVICE_API_KEY", "")
LIVENESS_DEVICE_KEY = os.getenv("LIVENESS_DEVICE_KEY", "")
SESSION_SECRET = os.getenv("SESSION_SECRET", "")
FERNET_KEY = os.getenv("FERNET_KEY", "")
CORS_ORIGINS = [
    value.strip()
    for value in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if value.strip()
]
MATCH_THRESHOLD = float(os.getenv("MATCH_THRESHOLD", "0.45"))
MIN_FACE_SIZE = int(os.getenv("MIN_FACE_SIZE", "100"))
MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", str(4 * 1024 * 1024)))

PHYSICAL_UNLOCK_ENABLED = env_bool("PHYSICAL_UNLOCK_ENABLED", False)
DOOR_RELAY_MODE = os.getenv("DOOR_RELAY_MODE", "disabled").strip().lower()
DOOR_RELAY_PULSE_MS = int(os.getenv("DOOR_RELAY_PULSE_MS", "1200"))
DOOR_RELAY_URL = os.getenv("DOOR_RELAY_URL", "")
DOOR_RELAY_TOKEN = os.getenv("DOOR_RELAY_TOKEN", "")
DOOR_GPIO_PIN = int(os.getenv("DOOR_GPIO_PIN", "17"))
DOOR_GPIO_ACTIVE_HIGH = env_bool("DOOR_GPIO_ACTIVE_HIGH", True)

# The system requires a per-person PIN in addition to the face match before
# any physical relay can be triggered. This is intentionally not configurable off.
REQUIRE_PERSONAL_PIN = True
