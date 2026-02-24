# 🎓 EduGuIA - Sistema de Perfil Educacional

O **EduGuIA** é uma plataforma inovadora baseada em Inteligência Artificial para mapeamento de perfis educacionais, psicológicos e socioeconômicos de estudantes. 

O sistema utiliza gamificação (jogos de resiliência e testes de estilos de aprendizagem) e conversas interativas para coletar dados não invasivos, processando-os via IA (OpenAI) para gerar painéis e relatórios analíticos dinâmicos para professores e gestores escolares.

## 🚀 Tecnologias Utilizadas
- **Frontend:** React, Next.js, TypeScript, CSS customizado.
- **Backend:** Python, FastAPI, SQLAlchemy.
- **Banco de Dados:** PostgreSQL.
- **Infraestrutura:** Docker & Docker Compose.
- **Inteligência Artificial:** Integração direta com a API da OpenAI.

## ⚙️ Como executar o projeto localmente

### 1. Subindo o Backend e Banco de Dados (Docker)
Na pasta `eduguia-backend`, crie um arquivo `.env` contendo as credenciais do banco e a sua `OPENAI_API_KEY`. Em seguida, execute:
```bash
docker-compose up -d --build 
```

O backend estará rodando em http://localhost:8000.

## 2. Subindo o Frontend (Next.js)
Abra um novo terminal, navegue até a pasta `frontend` e instale as dependências:

```bash
npm install

```

Em seguida, inicie o servidor de desenvolvimento:


```bash
npm run dev
Acesse a aplicação em http://localhost:3000.
```