from __future__ import annotations

import os
import sys
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# Carrega .env (se existir) do backend
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Localiza a pasta BD (../BD a partir de backend/src/config.py)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BD_DIR = PROJECT_ROOT / "BD"

if str(BD_DIR) not in sys.path:
    sys.path.insert(0, str(BD_DIR))

# Importa do BD (só funciona depois do sys.path acima)
from database import Database  # noqa: E402
from repositories import FaceDB  # noqa: E402


def _db_path() -> str:
    default = BD_DIR / "face.db"
    return os.getenv("FACEDB_PATH", str(default))


@lru_cache
def get_db() -> FaceDB:
    """Singleton da fachada do banco. Use Depends(get_db) nas rotas."""
    return FaceDB(path=_db_path())


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [o.strip() for o in raw.split(",") if o.strip()]
