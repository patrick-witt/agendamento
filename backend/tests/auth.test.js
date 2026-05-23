const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');
const errorMiddleware = require('../src/middlewares/error.middleware');
const supabase = require('../src/config/supabase');
const bcrypt = require('bcryptjs');

jest.mock('../src/config/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  single: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

process.env.JWT_SECRET = 'test_secret';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorMiddleware);

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('com dados válidos retorna 201 e token', async () => {
      supabase.maybeSingle.mockResolvedValue({ data: null, error: null });
      supabase.single.mockResolvedValue({
        data: { id: 'uuid', name: 'João Silva', email: 'joao@example.com', role: 'CUSTOMER' },
        error: null,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'senhaSegura123',
          phone: '11999999999',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'joao@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    it('com credenciais válidas retorna 200 e token', async () => {
      supabase.maybeSingle.mockResolvedValue({
        data: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'CUSTOMER',
          password_hash: 'hashed_password',
        },
        error: null,
      });
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@example.com',
          password: 'senhaSegura123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('com senha errada retorna 401', async () => {
      supabase.maybeSingle.mockResolvedValue({
        data: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'CUSTOMER',
          password_hash: 'hashed_password',
        },
        error: null,
      });
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@example.com',
          password: 'senhaErrada',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toHaveProperty('message', 'Credenciais inválidas');
    });
  });
});
