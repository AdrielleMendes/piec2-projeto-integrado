from fastapi import APIRouter, status
from src.config import get_db
from src.schemas.schema import CameraCreate, CameraResponse

router = APIRouter(prefix="/api/v1/cameras", tags=["Câmeras"])


@router.post("/", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
async def criar_camera(c: CameraCreate) -> CameraResponse:
    db = get_db()
    cid = db.cameras.criar(nome=c.nome, local=c.local, url=c.url)
    return CameraResponse(id=cid, nome=c.nome, local=c.local, url=c.url, ativo=1)


@router.get("/", response_model=list[CameraResponse])
async def listar_cameras() -> list[CameraResponse]:
    db = get_db()
    return [
        CameraResponse(id=r["id"], nome=r["nome"], local=r["local"],
                       url=r["url"], ativo=r["ativo"])
        for r in db.cameras.listar()
    ]
