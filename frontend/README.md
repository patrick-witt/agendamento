# Frontend - Sistema de Agendamento Online

Este é o cliente web (Frontend) desenvolvido com React e Vite para interagir com a API do Sistema de Agendamento Online.

## Tecnologias Utilizadas

- React.js + Vite
- TailwindCSS
- React Router DOM
- Axios
- React Hook Form
- date-fns
- lucide-react (Ícones)

## Estrutura de Páginas

- `/` - Landing page pública. Permite selecionar um serviço, escolher data/hora e realizar o cadastro/agendamento numa única tela.
- `/login` - Tela de autenticação.
- `/dashboard` (Admin) - Resumo de métricas e próximos agendamentos do dia.
- `/agendamentos` (Admin) - Listagem de todos os agendamentos e atualização de status (confirmar/cancelar).
- `/servicos` (Admin) - CRUD completo do catálogo de serviços oferecidos.

## Como Rodar Localmente

1. **Instale as dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configuração das Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz da pasta `frontend/` (ou renomeie o `.env.example`) com a URL do seu backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. Acesse no navegador: `http://localhost:5173` (ou a porta que o Vite indicar no terminal).

## Design System

As cores principais definidas foram baseadas no portfólio:
- Azul Escuro: `#1a3c5e`
- Verde: `#4CAF93`
- Cores de feedback padrão do Tailwind (verde, vermelho, amarelo) para status.
