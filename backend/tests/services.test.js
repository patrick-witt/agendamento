const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');
const errorMiddleware = require('../src/middlewares/error.middleware');
const supabase = require('../src/config/supabase');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/supabase', () => {
  const mSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  return mSupabase;
});

process.env.JWT_SECRET = 'test_secret';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorMiddleware);

describe('Services Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/services', () => {
    it('retorna 200 e array', async () => {
      const mockServices = [
        { id: '1', name: 'Corte de Cabelo', is_active: true },
        { id: '2', name: 'Barba', is_active: true },
      ];
      
      const queryMock = Promise.resolve({ data: mockServices, error: null });
      supabase.eq.mockReturnValue(queryMock);

      const response = await request(app).get('/api/services');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockServices);
    });
  });

  describe('POST /api/services', () => {
    it('sem token retorna 401', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({ name: 'Novo Serviço', price: 50, duration: 30 });

      expect(response.status).toBe(401);
      expect(response.body.error).toHaveProperty('message', 'Token de autenticação não fornecido');
    });

    it('com token de CUSTOMER retorna 403', async () => {
      const customerToken = jwt.sign(
        { id: 'uuid', role: 'CUSTOMER', email: 'test@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Novo Serviço', price: 50, duration: 30 });

      expect(response.status).toBe(403);
      expect(response.body.error).toHaveProperty('message', 'Acesso negado. Permissão insuficiente.');
    });
  });
});
