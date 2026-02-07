# 🚀 Projeto --- Guia de Execução

Este guia explica como rodar o projeto localmente passo a passo.

------------------------------------------------------------------------

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

-   Python 3.10 ou superior
-   Node.js e npm
-   Git (opcional, mas recomendado)

------------------------------------------------------------------------

## 🐍 Backend (Python)

### 1️⃣ Ativar o ambiente virtual

Na pasta raiz do projeto, execute:

**Windows**

``` bash
./venv/Scripts/activate
```

**Linux / Mac**

``` bash
source venv/bin/activate
```

------------------------------------------------------------------------

### 2️⃣ Instalar dependências

``` bash
pip install -r requirements.txt
```

------------------------------------------------------------------------

### 3️⃣ Rodar o backend

Execute o servidor conforme configurado no projeto, por exemplo:

``` bash
python app.py
```

ou

``` bash
flask run
```

(depende da configuração do projeto)

------------------------------------------------------------------------

## 🌐 Frontend (Dashboard)

Abra **outro terminal** e execute:

``` bash
cd dashboard
npm install
```

Depois, rode o frontend:

``` bash
npm run dev
```

ou

``` bash
npm start
```

(depende do projeto)

------------------------------------------------------------------------

## 📂 Estrutura básica do projeto

    projeto/
    │
    ├── dashboard/        # Frontend
    ├── venv/             # Ambiente virtual Python
    ├── requirements.txt
    └── backend arquivos

------------------------------------------------------------------------

## ⚠️ Observações

-   Backend e frontend devem rodar em terminais separados.
-   Sempre ative o ambiente virtual antes de rodar o backend.
-   A primeira execução do `npm install` pode demorar.

------------------------------------------------------------------------

## 💡 Problemas comuns

Atualizar pip:

``` bash
pip install --upgrade pip
```

Forçar reinstalação do npm:

``` bash
npm install --force
```

------------------------------------------------------------------------

✅ Pronto! Agora é só rodar o projeto.
