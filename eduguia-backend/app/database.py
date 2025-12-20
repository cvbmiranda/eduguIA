import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Pega a URL do arquivo .env (injetado pelo Docker)
DATABASE_URL = os.getenv("DATABASE_URL")

# Cria o motor de conexão
engine = create_engine(DATABASE_URL)

# Cria a fábrica de sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para criar os Models
Base = declarative_base()

# Dependência para injetar o banco nas rotas (Dependency Injection)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()