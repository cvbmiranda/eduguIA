from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class School(Base):
    __tablename__ = "schools"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    contato = Column(String)
    ativa = Column(Boolean, default=True)

    users = relationship("User", back_populates="school")


class Turma(Base):
    __tablename__ = "turmas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    ano = Column(Integer)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    matricula = Column(String, unique=True, index=True, nullable=True) 
    nome = Column(String)
    email = Column(String, unique=True, index=True)
    senha_hash = Column(String)
    role = Column(String, default="student")
    turma = Column(String, nullable=True) 
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True) 
    is_active = Column(Boolean, default=True)

    school = relationship("School", back_populates="users")
    
    # NOVO: O Fio invisível que conecta o Usuário ao seu Relatório Pedagógico
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


# ==========================================
# 📊 NOVA TABELA: PERFIL / RELATÓRIO DO ALUNO
# ==========================================
class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True, index=True)
    
    # Chave Estrangeira: Liga esse relatório a 1 único Aluno. 
    # ondelete="CASCADE" significa que se apagar o aluno, apaga o relatório junto!
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    # --- Bloco 1: Socioeconômico ---
    socio_responsavel = Column(String, default="Não informado")
    socio_escolaridade = Column(String, default="Não informado")
    socio_renda = Column(String, default="Não informado")
    socio_acesso = Column(String, default="Não informado")
    socio_espaco = Column(String, default="Não informado")
    socio_transporte = Column(String, default="Não informado")

    # --- Bloco 2: Psicológico e Emocional ---
    psico_autoestima = Column(String, default="Não avaliado")
    psico_resiliencia = Column(String, default="Não avaliado")
    psico_sentimento = Column(String, default="Não avaliado")
    psico_ansiedade = Column(String, default="Não avaliado")
    psico_relacao = Column(String, default="Não avaliado")
    psico_atencao = Column(String, default="Não avaliado")

    # --- Bloco 3: Pedagógico ---
    peda_inteligencia = Column(String, default="Pendente")
    peda_aprendizagem = Column(String, default="Pendente")
    peda_metodologia = Column(String, default="Pendente")
    peda_aptidoes = Column(String, default="Pendente")
    peda_nao_aptidoes = Column(String, default="Pendente")
    peda_autonomia = Column(String, default="Pendente")

    # --- Bloco 4: Resultados da IA ---
    ia_evasao = Column(String, default="Desconhecido")
    ia_defasagem = Column(String, default="Desconhecido")
    ia_engajamento = Column(String, default="Desconhecido")
    ia_empecilhos = Column(String, default="Nenhum mapeado")
    ia_met_sugerida = Column(String, default="Pendente de IA")
    ia_abordagem = Column(String, default="Pendente de IA")

    user = relationship("User", back_populates="profile")