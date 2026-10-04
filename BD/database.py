from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Union

import numpy as np

SCHEMA_PATH = Path(__file__).parent / "schema.sql"


class Database:
    """Gerencia conexão SQLite, inicialização do schema e helpers de embedding."""

    def __init__(self, path: Union[str, Path] = "face.db") -> None:
        self.path = str(path)

    # ---------- conexão ----------

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        return conn

    @contextmanager
    def cursor(self) -> Iterator[sqlite3.Cursor]:
        """Uso: with db.cursor() as cur: cur.execute(...)"""
        conn = self.connect()
        try:
            yield conn.cursor()
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def init_schema(self) -> None:
        sql = SCHEMA_PATH.read_text(encoding="utf-8")
        with self.cursor() as cur:
            cur.executescript(sql)

    # ---------- helpers de embedding ----------

    @staticmethod
    def embedding_to_blob(embedding: np.ndarray) -> bytes:
        """Converte um vetor float32 para bytes (BLOB)."""
        arr = np.asarray(embedding, dtype=np.float32).ravel()
        return arr.tobytes()

    @staticmethod
    def blob_to_embedding(blob: bytes) -> np.ndarray:
        """Converte bytes de volta para vetor float32."""
        return np.frombuffer(blob, dtype=np.float32)
