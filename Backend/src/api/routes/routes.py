from fastapi import APIRouter, status
from src.schemas.schema import LeadCreate, LeadResponse

router = APIRouter(
    prefix="/api/v1/leads",
    tags=["Leads"]
)

@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(lead_in: LeadCreate):
    """
    Endpoint para criar um novo lead.
    Recebe os dados do formulário no frontend, valida e depois salva no banco de dados.
    """
    # Aqui você chamaria a função do serviço que cria o lead no banco de dados
    # Por exemplo: lead = await create_lead_in_db(lead_in)
    
    # Para fins de exemplo, vamos retornar um lead fictício
    lead = LeadResponse(
        id=1,
        name=lead_in.name,
        email=lead_in.email,
        status="Novo"
    )
    
    return lead