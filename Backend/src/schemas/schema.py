from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nome completo do contato")
    email: EmailStr = Field(..., description="Endereço de e-mail válido")
    message: str = Field(..., min_length=10, max_length=1000, description="Intenção ou mensagem de contato")

class LeadResponse(BaseModel):
    id: int 
    name: str 
    email: EmailStr 
    status: str 

    class Config:
        from_attributes = True # isso permite a conversão de instancias do banco de dados ORM


# ===================== Dispositivos (Catálogo de Adesão) =====================

class DeviceOut(BaseModel):
    id: int
    name: str
    description: str
    category: str  # camera | sensor | fechadura | central | alarme
    monthly_price: float = Field(..., ge=0, description="Valor mensal da assinatura do dispositivo")
    installation_price: float = Field(..., ge=0, description="Taxa única de instalação")
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


# ===================== Pedidos de Adesão =====================

class OrderItemCreate(BaseModel):
    device_id: int = Field(..., ge=1)
    quantity: int = Field(..., ge=1, le=50)


class AddressCreate(BaseModel):
    zip_code: str = Field(..., min_length=8, max_length=9, description="CEP da instalação")
    street: str = Field(..., min_length=2, max_length=150)
    number: str = Field(..., min_length=1, max_length=10)
    complement: Optional[str] = Field(None, max_length=100)
    neighborhood: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=2, description="UF, ex: SP")


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: EmailStr
    customer_phone: str = Field(..., min_length=8, max_length=20)
    address: AddressCreate
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: EmailStr
    status: str
    monthly_total: float
    installation_total: float

    class Config:
        from_attributes = True