from fastapi import APIRouter, HTTPException, status

from src.config import get_db
from repositories import Pessoa
from src.schemas.schema import PessoaCreate, PessoaResponse

router = APIRouter(prefix="/api/v1/pessoas", tags=["Pessoas"])


@router.post("/", response_model=PessoaResponse, status_code=status.HTTP_201_CREATED)
async def criar_pessoa(p: PessoaCreate) -> PessoaResponse:
    db = get_db()
    try:
        pid = db.pessoas.criar(
            Pessoa(id=None, nome=p.nome, documento=p.documento, email=p.email)
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return PessoaResponse(id=pid, nome=p.nome, documento=p.documento,
                          email=p.email, ativo=1)


@router.get("/", response_model=list[PessoaResponse])
async def listar_pessoas() -> list[PessoaResponse]:
    db = get_db()
    rows = db.pessoas.listar()
    return [
        PessoaResponse(id=r["id"], nome=r["nome"], documento=r["documento"],
                       email=r["email"], ativo=r["ativo"])
        for r in rows
    ]


@router.get("/{pessoa_id}", response_model=PessoaResponse)
async def buscar_pessoa(pessoa_id: int) -> PessoaResponse:
    db = get_db()
    r = db.pessoas.buscar_por_id(pessoa_id)
    if r is None:
        raise HTTPException(status_code=404, detail="Pessoa não encontrada")
    return PessoaResponse(id=r["id"], nome=r["nome"], documento=r["documento"],
                          email=r["email"], ativo=r["ativo"])


@router.delete("/{pessoa_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_pessoa(pessoa_id: int) -> None:
    db = get_db()
    if db.pessoas.buscar_por_id(pessoa_id) is None:
        raise HTTPException(status_code=404, detail="Pessoa não encontrada")
    db.pessoas.deletar(pessoa_id)
