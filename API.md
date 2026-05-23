# API REST - Sistema de Agendamento Online

Este documento documenta os endpoints disponíveis na API REST do backend (Node.js/Express). O formato de comunicação padronizado é o JSON.

### Resumo das Rotas Disponíveis
* [Autenticação](#1-autenticação)
* [Serviços](#2-serviços)
* [Horários Disponíveis](#3-horários-disponíveis)
* [Agendamentos](#4-agendamentos)
* [Dashboard Admin](#5-dashboard-admin)

---

## 1. Autenticação

### 1.1 Registrar Usuário
- **Método:** `POST`
- **Rota:** `/api/auth/register`
- **Descrição:** Cria uma nova conta para um cliente.
- **Requer Autenticação:** Não
- **Payload de Entrada:**
  ```json
  {
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senhaSegura123",
    "phone": "11999999999"
  }
  ```
- **Payload de Saída (Sucesso 201):**
  ```json
  {
    "message": "Usuário registrado com sucesso",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5c..."
  }
  ```

### 1.2 Login
- **Método:** `POST`
- **Rota:** `/api/auth/login`
- **Descrição:** Autentica o usuário e retorna o token JWT para acesso a rotas privadas.
- **Requer Autenticação:** Não
- **Payload de Entrada:**
  ```json
  {
    "email": "joao@example.com",
    "password": "senhaSegura123"
  }
  ```
- **Payload de Saída (Sucesso 200):**
  ```json
  {
    "message": "Login realizado com sucesso",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "João Silva",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5c..."
  }
  ```

### 1.3 Logout
- **Método:** `POST`
- **Rota:** `/api/auth/logout`
- **Descrição:** Invalida a sessão do usuário (utilizado para blacklisting de token ou para documentar o processo do client).
- **Requer Autenticação:** Sim (JWT)
- **Payload de Entrada:** Vazio
- **Payload de Saída (Sucesso 200):**
  ```json
  {
    "message": "Logout realizado com sucesso"
  }
  ```

---

## 2. Serviços

### 2.1 Listar Serviços
- **Método:** `GET`
- **Rota:** `/api/services`
- **Descrição:** Retorna a lista de serviços. Se for um cliente não-autenticado, retorna apenas os ativos. Se for ADMIN, pode ver todos.
- **Requer Autenticação:** Não (Público)
- **Payload de Entrada:** Vazio
- **Payload de Saída (Sucesso 200):**
  ```json
  [
    {
      "id": "uuid",
      "name": "Corte de Cabelo Masculino",
      "description": "Corte moderno com máquina e tesoura",
      "duration": 45,
      "price": 50.00,
      "is_active": true
    }
  ]
  ```

### 2.2 Criar Serviço
- **Método:** `POST`
- **Rota:** `/api/services`
- **Descrição:** Cria um novo serviço no catálogo do negócio.
- **Requer Autenticação:** Sim (JWT, Role: ADMIN)
- **Payload de Entrada:**
  ```json
  {
    "name": "Barba Completa",
    "description": "Aparação, toalha quente e hidratação",
    "duration": 30,
    "price": 35.00
  }
  ```
- **Payload de Saída (Sucesso 201):**
  ```json
  {
    "message": "Serviço criado com sucesso",
    "service": {
      "id": "uuid",
      "name": "Barba Completa",
      "duration": 30,
      "price": 35.00,
      "is_active": true
    }
  }
  ```

### 2.3 Editar Serviço
- **Método:** `PUT`
- **Rota:** `/api/services/:id`
- **Descrição:** Atualiza os dados de um serviço existente (ex: alteração de preço, inativação).
- **Requer Autenticação:** Sim (JWT, Role: ADMIN)
- **Payload de Entrada:**
  ```json
  {
    "price": 40.00,
    "is_active": false
  }
  ```
- **Payload de Saída (Sucesso 200):**
  ```json
  {
    "message": "Serviço atualizado com sucesso",
    "service": {
      "id": "uuid",
      "name": "Barba Completa",
      "price": 40.00,
      "is_active": false
    }
  }
  ```

### 2.4 Deletar Serviço
- **Método:** `DELETE`
- **Rota:** `/api/services/:id`
- **Descrição:** Exclui permanentemente um serviço. Observação: a API deve retornar erro se já existirem agendamentos associados; sugerindo o uso de inativação.
- **Requer Autenticação:** Sim (JWT, Role: ADMIN)
- **Payload de Entrada:** Vazio
- **Payload de Saída (Sucesso 200):**
  ```json
  {
    "message": "Serviço removido com sucesso"
  }
  ```

---

## 3. Horários Disponíveis

### 3.1 Consultar Horários
- **Método:** `GET`
- **Rota:** `/api/availability`
- **Descrição:** Recebe a data e o serviço, e retorna apenas os horários vagos considerando conflitos e duração do serviço.
- **Requer Autenticação:** Não (Público/Opcional)
- **Query Params:** `?date=YYYY-MM-DD&service_id=UUID`
- **Exemplo URL:** `/api/availability?date=2024-05-25&service_id=uuid`
- **Payload de Entrada:** Vazio
- **Payload de Saída (Sucesso 200):**
  ```json
  {
    "date": "2024-05-25",
    "available_times": [
      "09:00",
      "10:00",
      "11:30",
      "14:00"
    ]
  }
  ```

---

## 4. Agendamentos

### 4.1 Criar Agendamento
- **Método:** `POST`
- **Rota:** `/api/appointments`
- **Descrição:** Realiza a marcação de um horário. O backend processa o `end_time` internamente com base no `service_id`.
- **Requer Autenticação:** Sim (JWT)
- **Payload de Entrada:**
  ```json
  {
    "service_id": "uuid",
    "appointment_date": "2024-05-25",
    "start_time": "14:00",
    "notes": "Prefiro atendimento pela lateral esquerda da clínica"
  }
  ```
- **Payload de Saída (Sucesso 201):**
  ```json
  {
    "message": "Agendamento realizado com sucesso",
    "appointment": {
      "id": "uuid",
      "status": "PENDING",
      "appointment_date": "2024-05-25",
      "start_time": "14:00",
      "end_time": "14:45"
    }
  }
  ```

### 4.2 Listar Agendamentos
- **Método:** `GET`
- **Rota:** `/api/appointments`
- **Descrição:** Lista os agendamentos. Clientes recebem apenas os seus próprios. Admins recebem de todos.
- **Requer Autenticação:** Sim (JWT)
- **Query Params (Opcionais):** `?status=CONFIRMED&date=2024-05-25`
- **Payload de Entrada:** Vazio
- **Payload de Saída (Sucesso 200):**
  ```json
  [
    {
      "id": "uuid",
      "service": {
        "id": "uuid",
        "name": "Corte de Cabelo Masculino"
      },
      "user": {
        "id": "uuid",
        "name": "João Silva"
      },
      "appointment_date": "2024-05-25",
      "start_time": "14:00",
      "end_time": "14:45",
      "status": "PENDING"
    }
  ]
  ```

### 4.3 Cancelar Agendamento
- **Método:** `PUT`
- **Rota:** `/api/appointments/:id/cancel`
- **Descrição:** Altera o status do agendamento para `CANCELLED`. Valida prazo limite se for requisitado pelo Cliente.
- **Requer Autenticação:** Sim (JWT - Dono do agendamento ou ADMIN)
- **Payload de Entrada:** Vazio
- **Payload de Saída (Sucesso 200):**
  ```json
  {
    "message": "Agendamento cancelado com sucesso",
    "appointment": {
      "id": "uuid",
      "status": "CANCELLED"
    }
  }
  ```

### 4.4 Confirmar Agendamento
- **Método:** `PUT`
- **Rota:** `/api/appointments/:id/confirm`
- **Descrição:** Admin aprova/confirma um agendamento pendente alterando seu status para `CONFIRMED`.
- **Requer Autenticação:** Sim (JWT, Role: ADMIN)
- **Payload de Entrada:** Vazio
- **Payload de Saída (Sucesso 200):**
  ```json
  {
    "message": "Agendamento confirmado",
    "appointment": {
      "id": "uuid",
      "status": "CONFIRMED"
    }
  }
  ```

---

## 5. Dashboard Admin

### 5.1 Resumo do Dia
- **Método:** `GET`
- **Rota:** `/api/dashboard/summary`
- **Descrição:** Endpoint unificado para alimentar a página principal do painel do Administrador. Retorna métricas globais para a data selecionada.
- **Requer Autenticação:** Sim (JWT, Role: ADMIN)
- **Query Params:** `?date=YYYY-MM-DD` (Opcional: Padrão é a data atual)
- **Payload de Entrada:** Vazio
- **Payload de Saída (Sucesso 200):**
  ```json
  {
    "date": "2024-05-20",
    "metrics": {
      "total_appointments": 15,
      "confirmed_appointments": 10,
      "pending_appointments": 3,
      "cancelled_appointments": 2,
      "estimated_revenue": 750.00
    },
    "upcoming_appointments": [
      {
        "id": "uuid",
        "time": "10:00",
        "client_name": "Maria Santos",
        "service_name": "Limpeza de Pele",
        "status": "CONFIRMED"
      },
      {
        "id": "uuid",
        "time": "11:30",
        "client_name": "Pedro Alves",
        "service_name": "Massagem Relaxante",
        "status": "PENDING"
      }
    ]
  }
  ```
