const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');
const errorMiddleware = require('../src/middlewares/error.middleware');
const supabase = require('../src/config/supabase');

jest.mock('../src/config/supabase', () => {
  const mSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  return mSupabase;
});

process.env.JWT_SECRET = 'test_secret';
process.env.BUSINESS_START = '09:00';
process.env.BUSINESS_END = '18:00';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorMiddleware);

describe('Appointments & Availability Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/appointments', () => {
    it('sem token retorna 401', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          service_id: 'uuid',
          appointment_date: '2024-05-25',
          start_time: '14:00'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toHaveProperty('message', 'Token de autenticação não fornecido');
    });
  });

  describe('GET /api/availability', () => {
    it('com data e service_id válidos retorna 200', async () => {
      // Mock do service (retornando duração)
      supabase.single.mockResolvedValueOnce({
        data: { id: 'uuid', duration: 30, is_active: true },
        error: null,
      });

      // Mock dos appointments (retornando array vazio para nenhuma colisão)
      const queryMock = Promise.resolve({ data: [], error: null });
      supabase.in.mockReturnValue(queryMock);

      const response = await request(app)
        .get('/api/availability')
        .query({ date: '2030-05-25', service_id: 'uuid' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('available_times');
      expect(Array.isArray(response.body.available_times)).toBe(true);
    });
  });
});
