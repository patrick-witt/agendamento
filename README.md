# 📅 Studio Bella — Sistema de Agendamento Online

Sistema completo de agendamento para salões e estúdios de beleza, com fluxo público para clientes e painel administrativo.
Desenvolvido como portfólio profissional por **Patrick Witt**.

---

## ✨ Funcionalidades

### Cliente

- Agendar horário via wizard público em 3 passos (serviço → data/horário → confirmação)
- Consulta de horários disponíveis conforme o serviço e a data escolhidos
- Cadastro e autenticação para concluir o agendamento

### Admin

- Dashboard com métricas de agendamentos
- Gerenciar agendamentos e serviços
- Filtros por data e status

---

## 🛠 Tecnologias

| Frontend | Backend |
|----------|---------|
| React 18 | Node.js + Express |
| Vite | Supabase (PostgreSQL) |
| Tailwind CSS | JWT + bcryptjs |
| React Router | Joi (validação) |
| React Hook Form | date-fns |
| Axios | Jest + Supertest |
| Vitest + Testing Library | |

---

## 📁 Arquitetura

```
agendamento/
├── backend/
│   ├── src/
│   │   ├── config/          # Cliente Supabase
│   │   ├── controllers/     # Handlers das rotas
│   │   ├── middlewares/      # Auth, roles e erros
│   │   ├── routes/          # Rotas da API REST
│   │   ├── services/        # Regras de negócio
│   │   ├── utils/
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/         # Autenticação (AuthContext)
│   │   ├── pages/           # Home, Login, Dashboard, etc.
│   │   ├── services/        # Cliente HTTP (Axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta e projeto no [Supabase](https://supabase.com) com o schema configurado

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Windows: copy .env.example .env
# Edite o .env com suas credenciais
npm run dev
```

A API sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```

A aplicação abre em `http://localhost:5173` (porta padrão do Vite).

---

## 🔐 Variáveis de ambiente

Configure o arquivo `backend/.env` a partir de `backend/.env.example`:

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta em que a API Express será executada (padrão: `3000`) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_KEY` | Chave anon ou service role do Supabase |
| `JWT_SECRET` | Segredo usado para assinar e validar tokens JWT |
| `BUSINESS_START` | Horário de abertura do estabelecimento (ex.: `09:00`) |
| `BUSINESS_END` | Horário de fechamento do estabelecimento (ex.: `18:00`) |
| `CANCEL_LIMIT_HOURS` | Antecedência mínima em horas para permitir cancelamento |

No frontend, opcionalmente defina `VITE_API_URL` em `frontend/.env` (padrão: `http://localhost:3000`).

---

## 🧪 Testes

### Backend

```bash
cd backend
npm test
```

Cobertura principal:

- **Auth** — registro, login e credenciais inválidas
- **Appointments & Availability** — autenticação obrigatória e consulta de horários
- **Services** — listagem pública e restrições de perfil admin

### Frontend

```bash
cd frontend
npm test
```

Cobertura principal:

- **Wizard (Home)** — renderização do passo 1 e validação do botão Continuar
- **Login** — campos do formulário e exibição de erro com credenciais inválidas

---

## 👤 Autor

**Patrick Witt** — [github.com/patrick-witt](https://github.com/patrick-witt)
