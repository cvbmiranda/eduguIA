from sqlalchemy.orm import Session
from app import models, schemas
# Importamos a função do security.py para garantir que o hash seja IDÊNTICO ao do login
from .security import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # 1. Criptografar a senha usando a função centralizada
    hashed_password = get_password_hash(user.senha)
    
    # 2. Criar o objeto do modelo (Banco)
    db_user = models.User(
        email=user.email,
        nome=user.nome,
        # Aqui garantimos que estamos salvando na coluna certa 'senha_hash'
        senha_hash=hashed_password,
        role=user.role,
        turma_id=user.turma_id
    )
    
    # 3. Salvar no banco
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user