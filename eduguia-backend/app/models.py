from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Turma(Base):
    __tablename__ = "turmas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)  # Ex: "3º Ano A"
    ano = Column(Integer)              # Ex: 2024

    # Relacionamento: Uma turma tem vários alunos
    alunos = relationship("User", back_populates="turma")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    senha_hash = Column(String)
    role = Column(String, default="student")
    is_active = Column(Boolean, default=True)

    # Chave Estrangeira: Aponta para o ID da tabela turmas
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=True)

    # Relacionamento de volta: Um aluno sabe qual é a sua turma
    turma = relationship("Turma", back_populates="alunos")