from pydantic import BaseModel
from typing import List, Optional

# --- SCHEMAS DE TURMA (O que estava faltando) ---
class TurmaBase(BaseModel):
    nome: str
    ano: int

class TurmaCreate(TurmaBase):
    pass

class TurmaResponse(TurmaBase):
    id: int
    
    class Config:
        from_attributes = True

# --- SCHEMAS DE USUÁRIO ---
class UserBase(BaseModel):
    nome: str
    email: str
    role: str = "student"
    # Campo novo para vincular o aluno à turma
    turma_id: Optional[int] = None 

class UserCreate(UserBase):
    senha: str

class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# --- SCHEMAS DE LOGIN (TOKEN) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- SCHEMAS DE CHAT (IA) ---
class ChatRequest(BaseModel):
    pergunta: str

class ChatResponse(BaseModel):
    resposta: str