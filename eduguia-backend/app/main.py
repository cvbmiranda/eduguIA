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
import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from collections import Counter

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
        else:
            # FORÇA O RESET DO ADMIN SE ELE JÁ EXISTIR NO SUPABASE
            admin.senha_hash = get_password_hash("123")
            admin.role = "admin"
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
    # Agora o form_data.username carrega a MATRÍCULA digitada na tela
    user = db.query(models.User).filter(models.User.matricula == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Matrícula ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.matricula}, expires_delta=access_token_expires # Mudamos email para matricula
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Users ---
@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_matricula(db, matricula=user.matricula)
    if db_user:
        raise HTTPException(status_code=400, detail="Matrícula já cadastrada")
    return crud.create_user(db=db, user=user)

# Rota para devolver quem está logado
@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# ROTA PARA A GESTÃO SALVAR AS ALTERAÇÕES DO USUÁRIO (NOVO!)
@app.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user_route(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    updated_user = crud.update_user(db, user_id=user_id, user_data=user)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return updated_user


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


# ==========================================
# --- RELATÓRIO ANALÍTICO DE TURMA (IA) ---
# ==========================================
@app.get("/reports/turma/{turma_nome}")
def get_turma_report(turma_nome: str, db: Session = Depends(get_db)):
    alunos = db.query(models.User).filter(models.User.turma == turma_nome, models.User.role == 'student').all()
    
    if not alunos:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
        
    perfis = [a.profile for a in alunos if a.profile]
    
    if len(perfis) == 0:
        raise HTTPException(status_code=400, detail="Os alunos desta turma ainda não geraram perfis com a IA.")

    # Função auxiliar para calcular a percentagem da resposta mais comum
    def calcular_top(campo, default="Sem dados suficientes"):
        valores = [getattr(p, campo) for p in perfis if getattr(p, campo) and getattr(p, campo) not in ["Pendente", "Não avaliado", "Não informado"]]
        if not valores: return default
        
        contador = Counter(valores)
        top = contador.most_common(2) # Pega os 2 mais comuns
        
        if len(top) == 1:
            return f"{int((top[0][1]/len(valores))*100)}% {top[0][0]}"
        else:
            return f"{int((top[0][1]/len(valores))*100)}% {top[0][0]} | {int((top[1][1]/len(valores))*100)}% {top[1][0]}"

    # Constrói o JSON com as estatísticas reais agregadas
    return {
        "socioeconomico": {
            "tempoMedio": calcular_top("socio_espaco", "Variado"), 
            "acessoInternet": calcular_top("socio_acesso", "Dados insuficientes"),
            "possuiEquip": calcular_top("socio_renda", "Não reportado")
        },
        "psicologico": {
            "vulnerabilidade": calcular_top("ia_evasao", "Risco não calculado"),
            "confianca": calcular_top("psico_autoestima", "Em avaliação"),
            "bullying": calcular_top("psico_relacao", "Sem alertas graves"),
            "atencao": calcular_top("psico_atencao", "Normal")
        },
        "pedagogico": {
            "intelDominantes": calcular_top("peda_inteligencia", "Múltiplas"),
            "aprendizado": calcular_top("peda_aprendizagem", "Misto"),
            "metEficazes": calcular_top("ia_met_sugerida", "Geral"),
            "aptidoes": calcular_top("peda_aptidoes", "Generalista"),
            "autonomia": calcular_top("peda_autonomia", "Dependente")
        },
        "abordagem": {
            "linguagem": calcular_top("ia_abordagem", "Clara e direta"),
            "recursos": calcular_top("peda_metodologia", "Tradicional")
        }
    }

# ==========================================
# --- EXPORTAÇÃO DE DADOS  ---
# ==========================================
@app.get("/export/students")
def export_students_csv(db: Session = Depends(get_db)):
    alunos = db.query(models.User).filter(models.User.role == 'student').all()
    
    output = StringIO()
    writer = csv.writer(output, delimiter=';') # Usa ponto e vírgula para o Excel entender colunas
    
    # Cabeçalho da Planilha
    writer.writerow([
        "Matrícula", "Nome", "Turma", "Email", "Status",
        "Resp. Familiar", "Renda Média", "Acesso Internet/PC", "Espaço de Estudo", "Transporte",
        "Autoestima", "Resiliência (Nota)", "Ansiedade", "Foco/Atenção", 
        "Estilo Aprendizagem", "Maior Aptidão",
        "IA - Risco Evasão", "IA - Defasagem", "IA - Engajamento", "IA - Metodologia Sugerida"
    ])
    
    for aluno in alunos:
        p = aluno.profile if aluno.profile else models.StudentProfile()
        writer.writerow([
            aluno.matricula, aluno.nome, aluno.turma, aluno.email, "Ativo" if aluno.is_active else "Inativo",
            p.socio_responsavel, p.socio_renda, p.socio_acesso, p.socio_espaco, p.socio_transporte,
            p.psico_autoestima, p.psico_resiliencia, p.psico_ansiedade, p.psico_atencao,
            p.peda_aprendizagem, p.peda_aptidoes,
            p.ia_evasao, p.ia_defasagem, p.ia_engajamento, p.ia_met_sugerida
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=relatorio_geral_alunos.csv"}
    )