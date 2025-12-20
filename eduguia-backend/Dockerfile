# Imagem base leve do Python
FROM python:3.11-slim

# Define diretório de trabalho
WORKDIR /app

# Instala dependências do sistema (necessário para o driver do Postgres)
RUN apt-get update \
    && apt-get install -y libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala bibliotecas Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código
COPY . .

# Expõe a porta (informativo)
EXPOSE 8000