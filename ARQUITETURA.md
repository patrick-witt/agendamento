# Arquitetura do Sistema de Agendamento Online

Este documento detalha a arquitetura do projeto de Agendamento Online, definindo a estrutura de arquivos, a modelagem do banco de dados, o fluxo de acesso de usuários e as principais regras de negócio.

## 1. Estrutura de Pastas

O projeto utiliza uma arquitetura baseada em pastas separadas para o frontend (React + Vite) e backend (Node.js + Express).

```text
/agendamento
├── /backend                 # Node.js + Express
│   ├── /src
│   │   ├── /config          # Configurações globais (banco de dados, env)
│   │   ├── /controllers     # Lógica de controle que responde às rotas (req, res)
│   │   ├── /middlewares     # Interceptadores (autenticação JWT, validações, erros)
│   │   ├── /models          # Modelos de dados (queries para PostgreSQL/Supabase)
│   │   ├── /routes          # Definição das rotas da API (endpoints)
│   │   ├── /services        # Regras de negócio isoladas dos controllers
│   │   ├── /utils           # Funções utilitárias (formatação de datas, criptografia)
│   │   └── server.js        # Ponto de entrada (entrypoint) do servidor backend
│   ├── .env                 # Arquivo com as variáveis de ambiente locais
│   ├── package.json         # Dependências de desenvolvimento e produção do backend
│   └── README.md            # Documentação e instruções de execução do backend
│
└── /frontend                # React + Vite + TailwindCSS
    ├── /public              # Arquivos estáticos puros (favicon, imagens cruas)
    ├── /src
    │   ├── /assets          # Recursos processados (Imagens, SVGs, CSS globais)
    │   ├── /components      # Componentes de UI reutilizáveis (Buttons, Inputs, Cards)
    │   ├── /contexts        # Contextos do React (Estado de Autenticação, Tema)
    │   ├── /hooks           # Hooks customizados (ex: useAuth, useFetch)
    │   ├── /pages           # Componentes de Páginas (Home, Login, Dashboard Admin)
    │   ├── /services        # Funções para chamadas externas (Axios para API backend)
    │   ├── /utils           # Funções utilitárias (máscaras de input, conversores)
    │   ├── App.jsx          # Componente raiz que agrupa as rotas
    │   └── main.jsx         # Ponto de entrada do React
    ├── index.html           # HTML principal (template do Vite)
    ├── tailwind.config.js   # Configurações de design system do TailwindCSS
    ├── vite.config.js       # Configuração do build e dev server
    └── package.json         # Dependências do frontend
```

## 2. Modelagem do Banco de Dados (PostgreSQL via Supabase)

O banco de dados foi modelado em formato relacional com 3 tabelas principais.

### Tabela `users` (Usuários / Clientes e Administradores)
Gerencia quem acessa o sistema.

- `id` (UUID, Primary Key)
- `name` (VARCHAR, Not Null): Nome completo do usuário.
- `email` (VARCHAR, Unique, Not Null): E-mail para login.
- `password_hash` (VARCHAR, Not Null): Senha encriptada (Bcrypt).
- `phone` (VARCHAR, Nullable): Telefone para contato.
- `role` (ENUM: 'ADMIN', 'CUSTOMER', Default: 'CUSTOMER'): Define o nível de acesso.
- `created_at` (TIMESTAMP, Default: NOW())
- `updated_at` (TIMESTAMP, Default: NOW())

### Tabela `services` (Serviços Oferecidos)
Catálogo de serviços do estabelecimento (ex: Corte de cabelo, Massagem, Consulta).

- `id` (UUID, Primary Key)
- `name` (VARCHAR, Not Null): Nome do serviço.
- `description` (TEXT, Nullable): Descrição dos detalhes do serviço.
- `duration` (INTEGER, Not Null): Duração estimada em minutos.
- `price` (DECIMAL(10,2), Not Null): Valor cobrado.
- `is_active` (BOOLEAN, Default: TRUE): Permite inativar o serviço sem apagar o histórico (soft delete).
- `created_at` (TIMESTAMP, Default: NOW())

### Tabela `appointments` (Agendamentos)
Relaciona usuários, serviços e a linha do tempo.

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key referenciando `users.id`, Not Null)
- `service_id` (UUID, Foreign Key referenciando `services.id`, Not Null)
- `appointment_date` (DATE, Not Null): Data marcada.
- `start_time` (TIME, Not Null): Hora de início do atendimento.
- `end_time` (TIME, Not Null): Hora de término calculada via tempo de duração.
- `status` (ENUM: 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', Default: 'PENDING'): Estado do agendamento.
- `notes` (TEXT, Nullable): Observações deixadas pelo cliente ou admin.
- `created_at` (TIMESTAMP, Default: NOW())
- `updated_at` (TIMESTAMP, Default: NOW())

## 3. Diagrama de Fluxo de Acesso

Visualização textual de navegação e permissões baseadas em perfis.

```text
[ Visitante Público ]
   │
   ├──> Acessa [Página Inicial (Landing Page)]
   │      └──> Visualiza portfólio de serviços, preços, fotos e mapa.
   │
   └──> Acessa [Tela de Autenticação]
          ├──> Realiza Login (via e-mail/senha).
          └──> Registra-se como novo cliente.

========================================================================

[ Cliente Logado (Role: CUSTOMER) ]
   │
   └──> Acessa [Painel do Cliente]
          ├──> Fluxo de Agendamento:
          │      1. Seleciona o Serviço.
          │      2. Escolhe uma Data no Calendário.
          │      3. Visualiza horários disponíveis.
          │      4. Confirma agendamento.
          ├──> Histórico: Visualiza agendamentos futuros e passados.
          └──> Ações: Cancela agendamento (dentro do prazo permitido).

========================================================================

[ Administrador do Sistema (Role: ADMIN) ]
   │
   └──> Acessa [Dashboard Administrativo]
          ├──> Módulo Serviços: Criar, editar, ativar ou desativar serviços do catálogo.
          ├──> Módulo Agendamentos: 
          │      └──> Visão geral (Dia/Semana).
          │      └──> Ações em lote ou individuais: Confirmar, Cancelar, ou Marcar como 'Concluído'.
          └──> Resumo do Dia: Métricas rápidas (qtd. de agendamentos, previsão de receita).
```

## 4. Regras de Negócio

As regras de negócio serão implementadas no Backend (`/src/services`) para garantir consistência.

- **Horários Disponíveis (Disponibilidade):**
  - O sistema opera dentro de uma faixa de horário pré-definida no `.env` (ex: `BUSINESS_START=09:00`, `BUSINESS_END=18:00`).
  - Um horário só é listado como disponível se:
    1. O tempo de duração do serviço couber inteiramente antes do fechamento (`BUSINESS_END`).
    2. O bloco de tempo `[start_time, end_time]` não conflitar com horários cujo `status` seja `PENDING` ou `CONFIRMED`.

- **Validação de Conflitos (Prevenção de Double-Booking):**
  - Na tentativa de criação de um `appointment`, a API deve realizar um *lock* ou verificação estrita: buscar no banco se já existe agendamento que cruze a faixa de horário solicitada naquele dia. Se houver, a operação é rejeitada (Erro 409 Conflict).

- **Regras de Cancelamento:**
  - **Cliente:** Pode cancelar o agendamento através do painel, com antecedência mínima de X horas (ex: 12h ou 24h configuráveis). Após o limite, o cancelamento é bloqueado no botão e um alerta instrui o contato manual com a clínica.
  - **Administrador:** Possui autoridade irrestrita para cancelar agendamentos a qualquer momento ou estado.

- **Datas Passadas:**
  - O banco e a API bloqueiam criação de agendamentos com `appointment_date` inferior ou igual à data de "ontem".

- **Soft Delete de Serviços:**
  - Serviços não são excluídos (`DELETE`) do banco de dados se já existirem agendamentos atrelados (mesmo históricos). O sistema utiliza `is_active = FALSE`, o que o remove do catálogo para os clientes, mantendo a integridade referencial dos agendamentos antigos.
