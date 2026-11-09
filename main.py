from __future__ import annotations

import base64
import binascii
import secrets
import struct

import numpy as np
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator

from . import config
from .database import db
from .door import unlock_door
from .face_engine import (
    DETECTOR_FILE,
    RECOGNIZER_FILE,
    MODEL_NAME,
    MODEL_VERSION,
    FaceProcessingError,
    cosine_similarity,
    get_face_engine,
)
from .security import create_admin_token, hash_pin, require_admin, require_admin_or_device, verify_pin

app = FastAPI(
    title="NexGuard — Controle de Acesso",
    description=(
        "Controle de acesso residencial por reconhecimento facial. "
        "Imagens são processadas em memória e não são armazenadas."
    ),
    version="2.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Device-Key", "X-Liveness-Token"],
)


class AdminLogin(BaseModel):
    password: str = Field(min_length=1, max_length=256)


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 28800


class ImagePayload(BaseModel):
    image_base64: str = Field(min_length=100, max_length=6_000_000)

    @field_validator("image_base64")
    @classmethod
    def only_jpeg_data(cls, value: str) -> str:
        # Aceita data URL ou base64 puro. O conteúdo é decodificado sem criar arquivo.
        if value.startswith("data:"):
            if "," not in value:
                raise ValueError("Envie uma imagem JPEG ou PNG.")
            header, value = value.split(",", 1)
            if header.lower() not in {"data:image/jpeg;base64", "data:image/jpg;base64", "data:image/png;base64"}:
                raise ValueError("Envie uma imagem JPEG ou PNG.")
        return value


class EnrollPayload(ImagePayload):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr | None = None
    access_pin: str = Field(min_length=4, max_length=8, pattern=r"^\d{4,8}$")
    consent_confirmed: bool


class ScanPayload(ImagePayload):
    access_pin: str | None = Field(default=None, min_length=4, max_length=8, pattern=r"^\d{4,8}$")


class AuthorizationUpdate(BaseModel):
    authorized: bool


def _encoded_image_dimensions(raw: bytearray) -> tuple[int, int]:
    # Lê as dimensões do cabeçalho antes de decodificar, evitando imagens comprimidas gigantes.
    if raw.startswith(b"\x89PNG\r\n\x1a\n") and len(raw) >= 24:
        width, height = struct.unpack(">II", raw[16:24])
        return width, height
    if raw.startswith(b"\xff\xd8"):
        index = 2
        sof_markers = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
        while index + 9 < len(raw):
            if raw[index] != 0xFF:
                index += 1
                continue
            while index < len(raw) and raw[index] == 0xFF:
                index += 1
            if index >= len(raw):
                break
            marker = raw[index]
            index += 1
            if marker in {0xD8, 0xD9, 0x01} or 0xD0 <= marker <= 0xD7:
                continue
            if index + 2 > len(raw):
                break
            segment_length = int.from_bytes(raw[index:index + 2], "big")
            if segment_length < 2 or index + segment_length > len(raw):
                break
            if marker in sof_markers and segment_length >= 7:
                height = int.from_bytes(raw[index + 3:index + 5], "big")
                width = int.from_bytes(raw[index + 5:index + 7], "big")
                return width, height
            index += segment_length
    raise HTTPException(status_code=400, detail="Formato de imagem inválido. Use JPEG ou PNG.")


def _decode_image(value: str) -> bytearray:
    try:
        raw = bytearray(base64.b64decode(value, validate=True))
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Imagem base64 inválida.") from exc
    if len(raw) > config.MAX_IMAGE_BYTES:
        raw[:] = b"\x00" * len(raw)
        raise HTTPException(status_code=413, detail="Imagem excede o limite de 4 MB.")
    if len(raw) < 100:
        raw[:] = b"\x00" * len(raw)
        raise HTTPException(status_code=400, detail="Imagem vazia ou inválida.")
    try:
        width, height = _encoded_image_dimensions(raw)
        if width < 240 or height < 240 or width > 4096 or height > 4096 or width * height > 16_000_000:
            raise HTTPException(status_code=413, detail="Resolução de imagem não permitida.")
    except Exception:
        raw[:] = b"\x00" * len(raw)
        raise
    return raw


def _store_event(decision: str, reason: str, person_id: int | None = None, door_opened: bool = False) -> None:
    with db.cursor() as cursor:
        cursor.execute(
            "INSERT INTO access_events (person_id, decision, reason, door_opened) VALUES (?, ?, ?, ?)",
            (person_id, decision, reason[:120], int(door_opened)),
        )


def _active_templates() -> list[tuple[dict, np.ndarray]]:
    with db.cursor() as cursor:
        rows = cursor.execute(
            """SELECT f.id AS face_id, f.person_id, f.embedding_encrypted, f.dimension,
                      p.name, p.pin_hash
               FROM face_templates f
               JOIN people p ON p.id = f.person_id
               WHERE f.active = 1 AND p.authorized = 1"""
        ).fetchall()
    templates: list[tuple[dict, np.ndarray]] = []
    for row in rows:
        vector = db.decrypt_embedding(row["embedding_encrypted"], row["dimension"])
        templates.append((dict(row), vector))
    return templates


@app.on_event("startup")
async def startup() -> None:
    if not config.ADMIN_API_KEY or not config.SESSION_SECRET or not config.FERNET_KEY:
        raise RuntimeError("Configure ADMIN_API_KEY, SESSION_SECRET e FERNET_KEY no .env antes de iniciar a API.")
    db._fernet()  # valida a chave criptográfica antes de aceitar cadastros.
    if config.PHYSICAL_UNLOCK_ENABLED:
        if not config.DEVICE_API_KEY or not config.LIVENESS_DEVICE_KEY:
            raise RuntimeError("A abertura física exige DEVICE_API_KEY e LIVENESS_DEVICE_KEY.")
        if config.DOOR_RELAY_MODE not in {"http", "gpio"}:
            raise RuntimeError("DOOR_RELAY_MODE deve ser http ou gpio quando a abertura física estiver habilitada.")
        if config.DOOR_RELAY_MODE == "http" and (not config.DOOR_RELAY_URL or not config.DOOR_RELAY_TOKEN):
            raise RuntimeError("Configure DOOR_RELAY_URL e DOOR_RELAY_TOKEN para o controlador HTTP.")
    db.initialize()


@app.get("/health")
async def health() -> dict:
    detector_ok = (config.MODEL_DIR / DETECTOR_FILE).is_file()
    recognizer_ok = (config.MODEL_DIR / RECOGNIZER_FILE).is_file()
    return {
        "status": "online",
        "application": "NexGuard Access Control",
        "models_ready": detector_ok and recognizer_ok,
        "physical_unlock_enabled": config.PHYSICAL_UNLOCK_ENABLED,
        "trusted_liveness_configured": bool(config.LIVENESS_DEVICE_KEY),
        "relay_mode": config.DOOR_RELAY_MODE,
        "image_storage": False,
    }


@app.post("/api/v1/auth/admin", response_model=AdminLoginResponse)
async def admin_login(payload: AdminLogin) -> AdminLoginResponse:
    if not config.ADMIN_API_KEY or not secrets.compare_digest(payload.password, config.ADMIN_API_KEY):
        raise HTTPException(status_code=401, detail="Credenciais administrativas inválidas.")
    try:
        token = create_admin_token()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return AdminLoginResponse(access_token=token)


@app.get("/api/v1/people")
async def list_people(_: None = Depends(require_admin)) -> list[dict]:
    with db.cursor() as cursor:
        rows = cursor.execute(
            "SELECT id, name, email, authorized, created_at FROM people ORDER BY name"
        ).fetchall()
    return [dict(row) for row in rows]


@app.post("/api/v1/people/enroll", status_code=status.HTTP_201_CREATED)
async def enroll_person(payload: EnrollPayload, _: None = Depends(require_admin)) -> dict:
    if not payload.consent_confirmed:
        raise HTTPException(status_code=400, detail="É necessário confirmar o consentimento para o cadastro biométrico.")

    image = _decode_image(payload.image_base64)
    feature = None
    try:
        try:
            result = get_face_engine().embedding_from_bytes(image)
            feature = result.embedding
        except FaceProcessingError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

        # Evita cadastrar o mesmo rosto em mais de uma conta autorizada.
        for _, existing in _active_templates():
            similarity = cosine_similarity(feature, existing)
            existing.fill(0)
            if similarity >= config.MATCH_THRESHOLD:
                raise HTTPException(status_code=409, detail="Este rosto já está associado a um cadastro autorizado.")

        pin_hash = hash_pin(payload.access_pin)
        encrypted = db.encrypt_embedding(feature)
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO people (name, email, authorized, pin_hash, consent_at) VALUES (?, ?, 1, ?, datetime('now'))",
                (payload.name.strip(), str(payload.email) if payload.email else None, pin_hash),
            )
            person_id = cursor.lastrowid
            cursor.execute(
                """INSERT INTO face_templates
                   (person_id, embedding_encrypted, dimension, model_name, model_version, quality)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (person_id, encrypted, int(feature.size), MODEL_NAME, MODEL_VERSION, result.quality),
            )
        return {"id": person_id, "name": payload.name.strip(), "authorized": True, "message": "Pessoa cadastrada. A imagem original não foi armazenada."}
    finally:
        image[:] = b"\x00" * len(image)
        if feature is not None:
            feature.fill(0)


@app.patch("/api/v1/people/{person_id}/authorization")
async def update_authorization(person_id: int, payload: AuthorizationUpdate, _: None = Depends(require_admin)) -> dict:
    with db.cursor() as cursor:
        cursor.execute("UPDATE people SET authorized = ? WHERE id = ?", (int(payload.authorized), person_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada.")
    return {"id": person_id, "authorized": payload.authorized}


@app.delete("/api/v1/people/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_person(person_id: int, _: None = Depends(require_admin)) -> None:
    with db.cursor() as cursor:
        cursor.execute("DELETE FROM people WHERE id = ?", (person_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada.")


@app.post("/api/v1/access/recognize")
async def recognize_access(
    payload: ScanPayload,
    actor: str = Depends(require_admin_or_device),
    x_liveness_token: str | None = Header(default=None),
) -> dict:
    raw_image = _decode_image(payload.image_base64)
    probe = None
    matched_person: dict | None = None
    matched_score = -1.0
    try:
        try:
            result = get_face_engine().embedding_from_bytes(raw_image)
            probe = result.embedding
        except FaceProcessingError as exc:
            _store_event("low_quality", "low_quality")
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except RuntimeError as exc:
            _store_event("system_error", "face_engine_unavailable")
            raise HTTPException(status_code=503, detail=str(exc)) from exc

        templates = _active_templates()
        best: tuple[dict, float] | None = None
        second_best = -1.0
        for person, vector in templates:
            score = cosine_similarity(probe, vector)
            vector.fill(0)
            if best is None or score > best[1]:
                if best is not None:
                    second_best = best[1]
                best = (person, score)
            elif score > second_best:
                second_best = score

        if best is None or best[1] < config.MATCH_THRESHOLD:
            _store_event("denied", "unknown_or_not_authorized")
            return {
                "authorized": False,
                "door_opened": False,
                "decision": "denied",
                "message": "Acesso negado. Rosto não cadastrado ou sem autorização.",
            }

        # Evita conceder acesso se duas identidades tiverem pontuações quase iguais.
        if second_best >= config.MATCH_THRESHOLD and (best[1] - second_best) < 0.03:
            _store_event("denied", "ambiguous_match")
            return {
                "authorized": False,
                "door_opened": False,
                "decision": "denied",
                "message": "Acesso negado. Identificação ambígua; solicite verificação manual.",
            }

        matched_person = best[0]
        if not payload.access_pin or not verify_pin(payload.access_pin, matched_person["pin_hash"]):
            _store_event("denied", "invalid_or_missing_pin", int(matched_person["person_id"]))
            return {
                "authorized": False,
                "door_opened": False,
                "decision": "denied",
                "message": "Rosto reconhecido, mas o PIN pessoal está ausente ou incorreto. Porta mantida trancada.",
            }

        # A aprovação exige rosto autorizado + PIN pessoal. Sem hardware configurado,
        # o sistema informa a aprovação, mas não simula uma abertura física.
        liveness_verified = bool(
            actor == "device"
            and x_liveness_token
            and config.LIVENESS_DEVICE_KEY
            and secrets.compare_digest(x_liveness_token, config.LIVENESS_DEVICE_KEY)
        )
        opened, relay_message = await unlock_door(liveness_verified=liveness_verified)
        _store_event("granted", "face_and_pin_verified", int(matched_person["person_id"]), opened)
        return {
            "authorized": True,
            "door_opened": opened,
            "decision": "granted",
            "person": {"id": int(matched_person["person_id"]), "name": matched_person["name"]},
            "message": "Acesso autorizado. " + relay_message + ".",
        }
    finally:
        raw_image[:] = b"\x00" * len(raw_image)
        if probe is not None:
            probe.fill(0)


@app.get("/api/v1/access/events")
async def access_events(limit: int = 30, _: None = Depends(require_admin)) -> list[dict]:
    limit = max(1, min(limit, 100))
    with db.cursor() as cursor:
        rows = cursor.execute(
            """SELECT e.id, e.decision, e.reason, e.door_opened, e.created_at,
                      CASE WHEN e.decision = 'granted' THEN p.name ELSE NULL END AS person_name
               FROM access_events e LEFT JOIN people p ON p.id = e.person_id
               ORDER BY e.id DESC LIMIT ?""",
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


@app.get("/api/v1/models/status")
async def model_status(_: None = Depends(require_admin)) -> dict:
    return {
        "detector": (config.MODEL_DIR / DETECTOR_FILE).is_file(),
        "recognizer": (config.MODEL_DIR / RECOGNIZER_FILE).is_file(),
        "model": MODEL_NAME,
        "version": MODEL_VERSION,
        "threshold": config.MATCH_THRESHOLD,
    }
