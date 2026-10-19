import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_cors_origins, get_db
from src.api.routes.leads import router as leads_router
from src.api.routes.pessoas import router as pessoas_router
from src.api.routes.faces import router as faces_router
from src.api.routes.cameras import router as cameras_router
from src.api.routes.reconhecimentos import router as reconhecimentos_router

app = FastAPI(
    title="SafeHouse API",
    description="API da NexGuard — captação de leads e reconhecimento facial.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa o schema do BD no startup (idempotente)
@app.on_event("startup")
async def _startup() -> None:
    get_db()  # cria o FaceDB, dispara init_schema

for r in (leads_router, pessoas_router, faces_router, cameras_router, reconhecimentos_router):
    app.include_router(r)


@app.get("/health")
async def health_check():
    return {
        "status": "Online",
        "timestamp": time.time(),
        "message": "Conexão com SafeHouse API concluída.",
    }
