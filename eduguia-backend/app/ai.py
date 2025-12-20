import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

def ask_gpt(pergunta: str):
    # Se não tiver chave configurada, retorna um mock para não quebrar
    if not api_key or api_key == "teste":
        return "Simulação: Eu sou a IA do EduGuIA. Para eu funcionar de verdade, configure a API Key no arquivo .env!"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Ou "gpt-4" se tiver acesso
            messages=[
                {"role": "system", "content": "Você é um tutor educacional útil e gentil chamado EduGuIA. Responda de forma didática."},
                {"role": "user", "content": pergunta}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Erro ao contatar a IA: {str(e)}"