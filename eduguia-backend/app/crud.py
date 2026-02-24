from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app import models, schemas
from .security import get_password_hash

# ==========================================
# --- ESCOLAS ---
# ==========================================
def create_school(db: Session, school: schemas.SchoolCreate):
    is_active = True if school.ativa == "Sim" else False
    db_school = models.School(nome=school.nome, contato=school.contato, ativa=is_active)
    try:
        db.add(db_school)
        db.commit()
        db.refresh(db_school)
        return db_school
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao salvar escola.")

def get_schools(db: Session, skip: int = 0, limit: int = 100):
    schools = db.query(models.School).offset(skip).limit(limit).all()
    for s in schools: s.ativa = "Sim" if s.ativa else "Não"
    return schools

def update_school(db: Session, school_id: int, school: schemas.SchoolCreate):
    db_school = db.query(models.School).filter(models.School.id == school_id).first()
    if db_school:
        db_school.nome = school.nome
        db_school.contato = school.contato
        db_school.ativa = True if school.ativa == "Sim" else False
        db.commit()
        db.refresh(db_school)
    return db_school

def delete_school(db: Session, school_id: int):
    db_school = db.query(models.School).filter(models.School.id == school_id).first()
    if db_school:
        db.delete(db_school)
        db.commit()
    return db_school

# ==========================================
# --- USUÁRIOS ---
# ==========================================
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.senha)
    is_active = True if user.ativo == "Sim" else False
    
    # Valida se o ID da escola é um número válido
    try:
        school_id_int = int(user.school_id) if user.school_id and str(user.school_id).strip() != "" else None
    except ValueError:
        raise HTTPException(status_code=400, detail="O School ID deve ser um número.")

    db_user = models.User(
        matricula=user.matricula, nome=user.nome, email=user.email,
        senha_hash=hashed_password, role=user.role, turma=user.turma,
        school_id=school_id_int, is_active=is_active
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        # Se tentar colocar uma escola que não existe, o sistema avisa!
        raise HTTPException(status_code=400, detail="Verifique se o School ID realmente existe na tabela de Escolas ou se o Email/Matrícula já estão em uso.")

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# ==========================================
# --- RELATÓRIOS E PERFIS (NOVO!) ---
# ==========================================
def get_student_profile(db: Session, user_id: int):
    # Busca o perfil. Se não existir, cria um vazio para não dar erro no Frontend
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == user_id).first()
    if not profile:
        profile = models.StudentProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

def update_student_profile(db: Session, user_id: int, profile_data: schemas.StudentProfileUpdate):
    db_profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == user_id).first()
    
    # Se incrivelmente ainda não existir, cria
    if not db_profile:
        db_profile = models.StudentProfile(user_id=user_id)
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)

    # Atualiza todas as colunas enviadas pelo site
    update_data = profile_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
        
    db.commit()
    db.refresh(db_profile)
    return db_profile