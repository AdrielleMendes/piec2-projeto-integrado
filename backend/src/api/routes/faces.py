import numpy as np
from fastapi import APIRouter, HTTPException, status

from src.config import get_db
from repositories import Face
from src.schemas.schema import FaceCreate, FaceResponse

router = APIRouter(prefix="/api/v1/faces", tags=["Faces"])


@router.post("/", response_model=FaceResponse, status_code=status.HTTP_201_CREATED)
async def registrar_face(payload: FaceCreate) -> FaceResponse:
    db = get_db()
    if db.pessoas.buscar_por_id(payload.pessoa_id) is None:
        raise HTTPException(status_code=404, detail="Pessoa não encontrada")

    arr = np.asarray(payload.embedding, dtype=np.float32)
    if arr.ndim != 1 or arr.size == 0:
        raise HTTPException(status_code=400, detail="Embedding inválido")

    face_id = db.faces.adicionar(Face(
        id=None,
        pessoa_id=payload.pessoa_id,
        embedding=arr,
        modelo=payload.modelo,
        versao_modelo=payload.versao_modelo,
        qualidade=payload.qualidade,
        imagem_path=payload.imagem_path,
    ))
    return FaceResponse(
        id=face_id, pessoa_id=payload.pessoa_id,
        dimensao=int(arr.size), modelo=payload.modelo,
        versao_modelo=payload.versao_modelo,
        qualidade=payload.qualidade, imagem_path=payload.imagem_path,
    )


@router.get("/pessoa/{pessoa_id}", response_model=list[FaceResponse])
async def listar_faces_da_pessoa(pessoa_id: int) -> list[FaceResponse]:
    db = get_db()
    rows = db.faces.listar_por_pessoa(pessoa_id)
    return [
        FaceResponse(
            id=r["id"], pessoa_id=r["pessoa_id"], dimensao=r["dimensao"],
            modelo=r["modelo"], versao_modelo=r["versao_modelo"],
            qualidade=r["qualidade"], imagem_path=r["imagem_path"],
        )
        for r in rows
    ]
