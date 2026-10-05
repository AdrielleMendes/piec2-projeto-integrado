from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
from src.api.routes.routes import router as leads_router

app = FastAPI(
    title="SafeHouse API",
    description="API do sistema SafeHouse",
    version="1.0.0"
)

# Config do CORS pra permitir requisições do frontend
origins = [
    "http://localhost:5173", #porta indicada lá no frontend
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # permite acesso aos métodos HTTP (get, post, etc)
    allow_headers=["*"]
)

app.include_router(leads_router) # add as rotas do leads_router no app principal

@app.get("/health")
async def health_check():
    """
    Endpoint para verificar o status da API.
    Retorna status 200 se a API estiver funcionando.
    """
    return {"status": "Online", "timestamp": time.time(), "message": "Conexão com SafeHouse API concluída."}