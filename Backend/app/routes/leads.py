from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from ..database import db
from ..security import require_admin

router = APIRouter(prefix="/api/v1/leads", tags=["Leads"])


class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(min_length=10, max_length=1000)


class LeadResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    status: str


class LeadStatusUpdate(BaseModel):
    status: Literal["Novo", "Em contato", "Qualificado", "Descartado"]


def _to_response(row) -> LeadResponse:
    return LeadResponse(
        id=row["id"],
        name=row["name"],
        email=row["email"],
        message=row["message"],
        status=row["status"],
    )


@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(payload: LeadCreate) -> LeadResponse:
    """Persiste o contato enviado pela landing page."""
    with db.cursor() as cursor:
        cursor.execute(
            "INSERT INTO leads (name, email, message, status) VALUES (?, ?, ?, 'Novo')",
            (payload.name.strip(), str(payload.email), payload.message.strip()),
        )
        lead_id = cursor.lastrowid
        row = cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
    return _to_response(row)


@router.get("/", response_model=list[LeadResponse])
async def list_leads(
    apenas_novos: bool = False,
    _: None = Depends(require_admin),
) -> list[LeadResponse]:
    """Lista contatos somente para administradores autenticados."""
    sql = "SELECT * FROM leads"
    if apenas_novos:
        sql += " WHERE status = 'Novo'"
    sql += " ORDER BY created_at DESC, id DESC"
    with db.cursor() as cursor:
        rows = cursor.execute(sql).fetchall()
    return [_to_response(row) for row in rows]


@router.patch("/{lead_id}/status", response_model=LeadResponse)
async def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    _: None = Depends(require_admin),
) -> LeadResponse:
    with db.cursor() as cursor:
        cursor.execute("UPDATE leads SET status = ? WHERE id = ?", (payload.status, lead_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Lead não encontrado.")
        row = cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
    return _to_response(row)
