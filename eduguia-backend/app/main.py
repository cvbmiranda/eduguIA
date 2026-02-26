import os
from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import json
from openai import OpenAI
from typing import List

# Inicia o motor da OpenAI usando a chave que você colocou no .env
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- Imports do seu projeto ---
from app.database import engine, get_db, SessionLocal 
from app import models, schemas, crud, ai
from .security import verify_password, create_access_token, get_current_user, get_password_hash

# --- Inicialização do Banco ---
models.Base.metadata.create_all(bind=engine)

# --- Inicialização do App ---
app = FastAPI(
    title="EduGuIA API",
    description="Backend Python com FastAPI + Frontend React Integrado"
)

# ==========================================
# 0. CONFIGURAÇÃO DE CORS (Para o Frontend)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ==========================================
# 🔥 SCRIPT SALVA-VIDAS (Cria Admin Automático)
# ==========================================
def init_db():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.email == "admin@eduguia.com").first()
        if not admin:
            new_admin = models.User(
                nome="Admin EduGuIA", 
                email="admin@eduguia.com", 
                senha_hash=get_password_hash("123"), 
                role="admin", 
                is_active=True
            )
            db.add(new_admin)
            db.commit()
    finally:
        db.close()

init_db()


# ==========================================
# 1. CONFIGURAÇÃO DO FRONTEND ESTÁTICO
# ==========================================
static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get("/")
async def read_index():
    index_file = os.path.join(static_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "EduGuIA Backend API rodando e aceitando conexões!"}


# ==========================================
# 2. ROTAS DE API (O Motor do Sistema)
# ==========================================

# --- Auth: Login e Token ---
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# --- Users ---
@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=list[schemas.UserResponse])
def read_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.User).offset(skip).limit(limit).all()

@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.delete("/users/{user_id}")
def delete_user_route(user_id: int, db: Session = Depends(get_db)):
    user = crud.delete_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário excluído com sucesso"}


# --- Escolas ---
@app.post("/schools/", response_model=schemas.SchoolResponse)
def create_school_route(school: schemas.SchoolCreate, db: Session = Depends(get_db)):
    return crud.create_school(db=db, school=school)

@app.get("/schools/", response_model=list[schemas.SchoolResponse])
def read_all_schools(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_schools(db, skip=skip, limit=limit)

@app.put("/schools/{school_id}", response_model=schemas.SchoolResponse)
def update_school_route(school_id: int, school: schemas.SchoolCreate, db: Session = Depends(get_db)):
    updated = crud.update_school(db, school_id=school_id, school=school)
    if not updated: raise HTTPException(status_code=404, detail="Escola não encontrada")
    return updated

@app.delete("/schools/{school_id}")
def delete_school_route(school_id: int, db: Session = Depends(get_db)):
    school = crud.delete_school(db, school_id=school_id)
    if not school: raise HTTPException(status_code=404, detail="Escola não encontrada")
    return {"message": "Escola excluída"}


# --- Turmas ---
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


# --- Chat IA ---
@app.post("/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(request: schemas.ChatRequest, current_user: models.User = Depends(get_current_user)):
    resposta_ia = ai.ask_gpt(request.pergunta, request.historico)
    return {"resposta": resposta_ia}

# ==========================================
# --- PERFIS E RELATÓRIOS ---
# ==========================================
@app.get("/profiles/{user_id}", response_model=schemas.StudentProfileResponse)
def read_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return crud.get_student_profile(db, user_id=user_id)

@app.put("/profiles/{user_id}", response_model=schemas.StudentProfileResponse)
def update_user_profile(user_id: int, profile: schemas.StudentProfileUpdate, db: Session = Depends(get_db)):
    return crud.update_student_profile(db, user_id=user_id, profile_data=profile)


@app.post("/chat/extract/{user_id}", response_model=schemas.StudentProfileResponse)
def extract_profile_from_chat(user_id: int, historico: List[schemas.MessageItem], db: Session = Depends(get_db)):
    
    texto_conversa = "\n".join([f"{msg.role}: {msg.content}" for msg in historico])
    
    # Adicionado log para rastreamento no terminal
    print(f"\n--- Iniciando Extração de Perfil via OpenAI para Usuário {user_id} ---")
    print(f"Texto da conversa enviado:\n{texto_conversa}\n")

    prompt_sistema = """
    Você é um psicólogo e pedagogo especialista em Learning Analytics.
    Leia a conversa do assistente com o estudante e extraia os dados para o perfil dele.
    
    Retorne APENAS um objeto JSON válido contendo exatamente as chaves abaixo. 
    Se a informação não foi mencionada na conversa, preencha com "Não informado" ou "Pendente".
    
    Chaves OBRIGATÓRIAS no JSON:
    "socio_responsavel", "socio_escolaridade", "socio_renda", "socio_acesso", "socio_espaco", "socio_transporte",
    "psico_autoestima", "psico_resiliencia", "psico_sentimento", "psico_ansiedade", "psico_relacao", "psico_atencao",
    "ia_evasao" (Ex: Baixo Risco, Médio Risco, Alto Risco), "ia_defasagem" (Ex: Nenhuma, Leve, Severa),
    "ia_engajamento" (Ex: 85%), "ia_empecilhos" (Resumo curto), "ia_met_sugerida" (Ex: Gamificação), "ia_abordagem" (Ex: Dinâmica e Visual).
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": f"Aqui está a conversa para você analisar:\n{texto_conversa}"}
            ],
            temperature=0.3
        )
        
        resultado_json = json.loads(response.choices[0].message.content)
        
        # Adicionado log para ver o que a IA devolveu
        print(f"Resposta JSON da OpenAI:\n{json.dumps(resultado_json, indent=2)}\n--- Fim da Extração ---")

        dados_perfil = schemas.StudentProfileUpdate(**resultado_json)
        return crud.update_student_profile(db, user_id=user_id, profile_data=dados_perfil)
        
    except Exception as e:
        print(f"Erro na comunicação com a OpenAI: {str(e)}") # Log do erro
        raise HTTPException(status_code=500, detail=f"Erro na OpenAI: {str(e)}")