from fastapi import APIRouter, status
from src.config import get_db
from src.schemas.schema import ReconhecimentoCreate, ReconhecimentoResponse

router = APIRouter(prefix="/api/v1/reconhecimentos", tags=["Reconhecimentos"])


@router.post("/", response_model=ReconhecimentoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_reconhecimento(r: ReconhecimentoCreate) -> ReconhecimentoResponse:
    db = get_db()
    rid = db.reconhecimentos.registrar(
        similaridade=r.similaridade, limiar=r.limiar, status=r.status,
        pessoa_id=r.pessoa_id, face_id=r.face_id, camera_id=r.camera_id,
        imagem_captura_path=r.imagem_captura_path,
    )
    return ReconhecimentoResponse(
        id=rid, pessoa_id=r.pessoa_id, face_id=r.face_id, camera_id=r.camera_id,
        similaridade=r.similaridade, limiar=r.limiar, status=r.status,
        imagem_captura_path=r.imagem_captura_path,
    )


@router.get("/", response_model=list[ReconhecimentoResponse])
async def listar_reconhecimentos(limite: int = 50) -> list[ReconhecimentoResponse]:
    db = get_db()
    return [
        ReconhecimentoResponse(
            id=r["id"], pessoa_id=r["pessoa_id"], face_id=r["face_id"],
            camera_id=r["camera_id"], similaridade=r["similaridade"],
            limiar=r["limiar"], status=r["status"],
            imagem_captura_path=r["imagem_captura_path"],
        )
        for r in db.reconhecimentos.ultimos(limite=limite)
    ]
