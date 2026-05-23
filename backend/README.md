# Backend - Agendamento Online

Este é o backend da aplicação de Agendamento Online, construído com Node.js, Express, PostgreSQL (via Supabase) e Autenticação JWT.

## Pré-requisitos

- Node.js v18+
- Projeto no Supabase criado.

## Configuração Inicial

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do backend copiando o `.env.example`:
   ```bash
   cp .env.example .env
   ```
   E preencha com suas credenciais do Supabase e sua chave JWT.

3. Execute o script `schema.sql` no SQL Editor do seu painel do Supabase para criar as tabelas necessárias.

## Rodando a Aplicação

Para desenvolvimento (com hot-reload):
```bash
npm run dev
```

Para produção:
```bash
npm start
```
