from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from fastapi import Header, HTTPException, status

from . import config


def hash_pin(pin: str) -> str:
    if not pin.isdigit() or not 4 <= len(pin) <= 8:
        raise ValueError("O PIN deve conter de 4 a 8 números.")
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(pin.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}:{digest.hex()}"


def verify_pin(pin: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.scrypt(pin.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def create_admin_token() -> str:
    if not config.SESSION_SECRET:
        raise RuntimeError("SESSION_SECRET não configurada.")
    now = int(time.time())
    payload = _b64url(json.dumps({"role": "admin", "iat": now, "exp": now + 8 * 60 * 60}).encode())
    signature = hmac.new(config.SESSION_SECRET.encode(), payload.encode(), hashlib.sha256).digest()
    return f"{payload}.{_b64url(signature)}"


def verify_admin_token(token: str) -> bool:
    if not config.SESSION_SECRET:
        return False
    try:
        payload, signature = token.split(".", 1)
        expected = hmac.new(config.SESSION_SECRET.encode(), payload.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))):
            return False
        data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        return data.get("role") == "admin" and int(data.get("exp", 0)) > int(time.time())
    except Exception:
        return False


def require_admin(authorization: str | None = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão administrativa necessária.")
    if not verify_admin_token(authorization[7:].strip()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida ou expirada.")


def require_admin_or_device(
    authorization: str | None = Header(default=None),
    x_device_key: str | None = Header(default=None),
) -> str:
    if authorization and authorization.startswith("Bearer ") and verify_admin_token(authorization[7:].strip()):
        return "admin"
    if x_device_key and config.DEVICE_API_KEY and secrets.compare_digest(x_device_key, config.DEVICE_API_KEY):
        return "device"
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Dispositivo não autenticado.")
