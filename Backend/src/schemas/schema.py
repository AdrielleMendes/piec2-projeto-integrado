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