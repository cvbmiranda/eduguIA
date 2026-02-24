from pydantic import BaseModel
from typing import List, Optional, Union

# ==========================================
# --- SCHEMAS: ESCOLA E TURMA ---
# ==========================================
class SchoolBase(BaseModel):
    nome: str
    contato: Optional[str] = None
    ativa: Optional[Union[str, bool]] = "Sim"

class SchoolCreate(SchoolBase): pass
class SchoolResponse(SchoolBase):
    id: int
    class Config: from_attributes = True

class TurmaBase(BaseModel):
    nome: str
    ano: int
class TurmaCreate(TurmaBase): pass
class TurmaResponse(TurmaBase):
    id: int
    class Config: from_attributes = True

# ==========================================
# --- SCHEMAS: USUÁRIO ---
# ==========================================
class UserBase(BaseModel):
    matricula: Optional[str] = None
    nome: str
    email: str
    role: str = "student"
    turma: Optional[str] = None 
    school_id: Optional[Union[int, str]] = None 
    ativo: Optional[Union[str, bool]] = "Sim"

class UserCreate(UserBase):
    senha: str

class UserUpdate(UserBase):
    senha: Optional[str] = None 

class UserResponse(UserBase):
    id: int
    is_active: bool
    class Config: from_attributes = True

# ==========================================
# --- SCHEMAS: PERFIL PEDAGÓGICO (NOVO!) ---
# ==========================================
class StudentProfileBase(BaseModel):
    socio_responsavel: Optional[str] = "Não informado"
    socio_escolaridade: Optional[str] = "Não informado"
    socio_renda: Optional[str] = "Não informado"
    socio_acesso: Optional[str] = "Não informado"
    socio_espaco: Optional[str] = "Não informado"
    socio_transporte: Optional[str] = "Não informado"

    psico_autoestima: Optional[str] = "Não avaliado"
    psico_resiliencia: Optional[str] = "Não avaliado"
    psico_sentimento: Optional[str] = "Não avaliado"
    psico_ansiedade: Optional[str] = "Não avaliado"
    psico_relacao: Optional[str] = "Não avaliado"
    psico_atencao: Optional[str] = "Não avaliado"

    peda_inteligencia: Optional[str] = "Pendente"
    peda_aprendizagem: Optional[str] = "Pendente"
    peda_metodologia: Optional[str] = "Pendente"
    peda_aptidoes: Optional[str] = "Pendente"
    peda_nao_aptidoes: Optional[str] = "Pendente"
    peda_autonomia: Optional[str] = "Pendente"

    ia_evasao: Optional[str] = "Desconhecido"
    ia_defasagem: Optional[str] = "Desconhecido"
    ia_engajamento: Optional[str] = "Desconhecido"
    ia_empecilhos: Optional[str] = "Nenhum mapeado"
    ia_met_sugerida: Optional[str] = "Pendente de IA"
    ia_abordagem: Optional[str] = "Pendente de IA"

class StudentProfileUpdate(StudentProfileBase):
    pass

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    class Config: from_attributes = True

# ==========================================
# --- SCHEMAS: CHAT E LOGIN ---
# ==========================================
class Token(BaseModel): access_token: str; token_type: str
class TokenData(BaseModel): email: Optional[str] = None
class MessageItem(BaseModel): role: str; content: str
class ChatRequest(BaseModel): pergunta: str; historico: List[MessageItem] = [] 
class ChatResponse(BaseModel): resposta: str