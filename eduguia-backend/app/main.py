import os
from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

# --- Imports do seu projeto ---
# Certifique-se que o __init__.py existe nas pastas para os imports funcionarem
from app.database import engine, get_db
from app import models, schemas, crud, ai
from .security import verify_password, create_access_token, get_current_user

# --- Inicialização do Banco ---
models.Base.metadata.create_all(bind=engine)

# --- Inicialização do App ---
app = FastAPI(
    title="EduGuIA API",
    description="Backend Python com FastAPI + Frontend SPA Integrado"
)

# ==========================================
# 1. CONFIGURAÇÃO DO FRONTEND (SPA)
# ==========================================

# Define onde está a pasta 'static'
# Se este arquivo (main.py) está na pasta 'app', ele procura 'app/static'
static_path = os.path.join(os.path.dirname(__file__), "static")

# Se o main.py estiver dentro de 'app/services', use a linha abaixo no lugar:
# static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

# Monta a rota para arquivos CSS e JS
# Ex: http://localhost:8000/static/styles.css
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Rota Raiz: Entrega o index.html (Sua Single Page Application)
@app.get("/")
async def read_index():
    index_file = os.path.join(static_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "EduGuIA Backend rodando! (Frontend não encontrado em /static)"}


# ==========================================
# 2. ROTAS DE API (O Motor do Sistema)
# ==========================================

# --- Auth: Login e Token ---
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Swagger/FastAPI injeta email no campo 'username'
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Token válido por 60 minutos
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# --- Users: Cadastro e Perfil ---
@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- Chat IA ---
@app.post("/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(request: schemas.ChatRequest, current_user: models.User = Depends(get_current_user)):
    # Aqui entra sua lógica de IA (OpenAI)
    resposta_ia = ai.ask_gpt(request.pergunta)
    return {"resposta": resposta_ia}

# --- Turmas (Gestão) ---
@app.post("/turmas/", response_model=schemas.TurmaResponse)
def create_turma(turma: schemas.TurmaCreate, db: Session = Depends(get_db)):
    db_turma = models.Turma(nome=turma.nome, ano=turma.ano)
    db.add(db_turma)
    db.commit()
    db.refresh(db_turma)
    return db_turma

@app.get("/turmas/", response_model=list[schemas.TurmaResponse])
def read_turmas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Turma).offset(skip).limit(limit).all()