from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

# ----------------- Leads -----------------
class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=1000)


class LeadResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    status: str


class LeadStatusUpdate(BaseModel):
    status: Literal["Novo", "Em contato", "Qualificado", "Descartado"]


# ----------------- Pessoas -----------------
class PessoaCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    documento: Optional[str] = None
    email: Optional[EmailStr] = None


class PessoaResponse(BaseModel):
    id: int
    nome: str
    documento: Optional[str] = None
    email: Optional[EmailStr] = None
    ativo: int


# ----------------- Faces -----------------
class FaceCreate(BaseModel):
    pessoa_id: int
    embedding: list[float] = Field(..., min_length=64, max_length=4096)
    modelo: str = "arcface_r100"
    versao_modelo: str = "v1.0"
    qualidade: Optional[float] = None
    imagem_path: Optional[str] = None


class FaceResponse(BaseModel):
    id: int
    pessoa_id: int
    dimensao: int
    modelo: str
    versao_modelo: str
    qualidade: Optional[float] = None
    imagem_path: Optional[str] = None


# ----------------- Câmeras -----------------
class CameraCreate(BaseModel):
    nome: str
    local: Optional[str] = None
    url: Optional[str] = None


class CameraResponse(BaseModel):
    id: int
    nome: str
    local: Optional[str] = None
    url: Optional[str] = None
    ativo: int


# ----------------- Reconhecimentos -----------------
class ReconhecimentoCreate(BaseModel):
    similaridade: float
    limiar: float
    status: Literal["match", "desconhecido", "baixa_qualidade"]
    pessoa_id: Optional[int] = None
    face_id: Optional[int] = None
    camera_id: Optional[int] = None
    imagem_captura_path: Optional[str] = None


class ReconhecimentoResponse(ReconhecimentoCreate):
    id: int
