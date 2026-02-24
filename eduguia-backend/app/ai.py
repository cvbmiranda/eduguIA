import os
from openai import OpenAI
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# ESTE É O SEU PROMPT ORIGINAL DO APPS SCRIPT!
SYSTEM_PROMPT = """Você é Edu, um assistente educacional brasileiro.
Objetivo: conduzir uma conversa natural e respeitosa para coletar, aos poucos, informações de PERFIL do estudante.
Adapte o tom ao jeito do aluno, use linguagem simples e acolhedora, sem jargões.
Pergunte por partes, reagindo ao que o aluno diz. Se a resposta já trouxer dados, salve-os para geração de perfil e siga para a proxima pergunta.
NUNCA faça diagnóstico clínico. Evite termos médicos. Foque em auto-relato.
Se o aluno demonstrar incômodo, ofereça pular/retomar depois.
No fim de cada resposta, faça 1 pergunta curta e objetiva, ligada ao que falta coletar. colete um dado de cada vez, fazendo apenas uma pergunta por vez.
Informações a obter (indiretamente quando possível):
1) Identificação: apelido/nome social, nome completo, série/ano, turma e gênero.
2) Socioeconômico: escolaridade dos pais, acesso à internet e celular, local e tempo para estudos, como vai a escola, renda familiar média.
3) Psicológico/Emocional: autoestima e autoconfiança, sentimentos sobre a escola, ansiedade/indisposição, relação com colegas, problemas de atenção/aprendizagem (auto-relato).
4) Pedagógico: inteligência (teoria das inteligências múltiplas de Howard Gardner); metodologia mais eficaz; matérias favoritas e não favoritas; autonomia.
Use perguntas indiretas, exemplos e listas quando ajudar; 1 pergunta por vez."""

def ask_gpt(pergunta: str, historico: list = None):
    if not api_key or api_key == "teste":
        return "Simulação: Configure a OPENAI_API_KEY no arquivo .env!"

    try:
        # 1. A IA sempre começa lendo as Regras de Perfil
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # 2. Inserimos toda a memória do que já foi conversado
        if historico:
            for msg in historico:
                messages.append({"role": msg.role, "content": msg.content})
        
        # 3. Adicionamos a pergunta atual por último
        messages.append({"role": "user", "content": pergunta})

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.4,
            max_tokens=350,
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Erro ao contatar a IA: {str(e)}"