from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from cryptography.fernet import Fernet, InvalidToken
import numpy as np

from . import config

SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    authorized INTEGER NOT NULL DEFAULT 1 CHECK (authorized IN (0,1)),
    pin_hash TEXT NOT NULL,
    consent_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS face_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    embedding_encrypted BLOB NOT NULL,
    dimension INTEGER NOT NULL,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    quality REAL NOT NULL,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_face_templates_person ON face_templates(person_id);
CREATE INDEX IF NOT EXISTS idx_face_templates_model ON face_templates(model_name, model_version);

CREATE TABLE IF NOT EXISTS access_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
    decision TEXT NOT NULL CHECK (decision IN ('granted','denied','low_quality','system_error')),
    reason TEXT NOT NULL,
    door_opened INTEGER NOT NULL DEFAULT 0 CHECK (door_opened IN (0,1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_access_events_created ON access_events(created_at);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


class Database:
    def __init__(self, path: Path | str | None = None) -> None:
        self.path = Path(path or config.DATABASE_PATH)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA busy_timeout = 10000")
        return conn

    @contextmanager
    def cursor(self) -> Iterator[sqlite3.Cursor]:
        connection = self.connect()
        try:
            cursor = connection.cursor()
            yield cursor
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self) -> None:
        connection = self.connect()
        try:
            connection.executescript(SCHEMA)
            connection.commit()
        finally:
            connection.close()
        self.purge_old_events(days=30)

    def purge_old_events(self, days: int = 30) -> None:
        with self.cursor() as cursor:
            cursor.execute(
                "DELETE FROM access_events WHERE created_at < datetime('now', ?)",
                (f"-{int(days)} days",),
            )

    @staticmethod
    def _fernet() -> Fernet:
        if not config.FERNET_KEY:
            raise RuntimeError("FERNET_KEY não configurada. Gere as chaves e configure o arquivo .env.")
        try:
            return Fernet(config.FERNET_KEY.encode("ascii"))
        except Exception as exc:
            raise RuntimeError("FERNET_KEY inválida. Gere uma chave Fernet válida.") from exc

    @classmethod
    def encrypt_embedding(cls, embedding: np.ndarray) -> bytes:
        vector = np.asarray(embedding, dtype=np.float32).reshape(-1)
        return cls._fernet().encrypt(vector.tobytes())

    @classmethod
    def decrypt_embedding(cls, encrypted: bytes, dimension: int) -> np.ndarray:
        try:
            raw = bytearray(cls._fernet().decrypt(encrypted))
            vector = np.frombuffer(raw, dtype=np.float32).copy()
            raw[:] = b"\x00" * len(raw)
        except (InvalidToken, ValueError) as exc:
            raise RuntimeError("Não foi possível descriptografar um modelo facial.") from exc
        if vector.size != dimension or not np.isfinite(vector).all():
            vector.fill(0)
            raise RuntimeError("Modelo facial armazenado está inválido.")
        return vector


db = Database()
