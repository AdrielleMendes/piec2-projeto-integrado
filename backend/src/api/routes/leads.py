from fastapi import APIRouter, HTTPException, status

from src.config import get_db
from src.schemas.schema import LeadCreate, LeadResponse, LeadStatusUpdate

router = APIRouter(prefix="/api/v1/leads", tags=["Leads"])


@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(lead_in: LeadCreate) -> LeadResponse:
    """Salva o lead enviado pelo formulário do site."""
    db = get_db()
    try:
        lead_id = db.leads.criar(
            name=lead_in.name,
            email=lead_in.email,
            message=lead_in.message,
        )
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Erro ao salvar lead: {exc}") from exc

    return LeadResponse(
        id=lead_id,
        name=lead_in.name,
        email=lead_in.email,
        message=lead_in.message,
        status="Novo",
    )


@router.get("/", response_model=list[LeadResponse])
async def list_leads(apenas_novos: bool = False) -> list[LeadResponse]:
    db = get_db()
    rows = db.leads.listar(apenas_novos=apenas_novos)
    return [
        LeadResponse(
            id=r["id"], name=r["name"], email=r["email"],
            message=r["message"], status=r["status"],
        )
        for r in rows
    ]


@router.patch("/{lead_id}/status", response_model=LeadResponse)
async def update_lead_status(lead_id: int, payload: LeadStatusUpdate) -> LeadResponse:
    db = get_db()
    if db.leads.buscar_por_id(lead_id) is None:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    db.leads.atualizar_status(lead_id, payload.status)
    r = db.leads.buscar_por_id(lead_id)
    return LeadResponse(
        id=r["id"], name=r["name"], email=r["email"],
        message=r["message"], status=r["status"],
    )
