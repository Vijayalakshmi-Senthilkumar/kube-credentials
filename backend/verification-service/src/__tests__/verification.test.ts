import request from 'supertest';
import app from '../app';
import { db } from '../database/db';

// Mock node-fetch
jest.mock('node-fetch');
const fetch = require('node-fetch');
const { Response } = jest.requireActual('node-fetch');

describe('Verification Service API', () => {
  beforeEach(() => {
    db.clearDatabase();
    jest.clearAllMocks();
  });

  describe('GET /api/verification/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/verification/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'verification-service');
      expect(response.body).toHaveProperty('workerId');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/verification/verify', () => {
    it('should verify a valid credential', async () => {
      const credentialData = {
        name: 'John Doe',
        degree: 'Bachelor of Science',
        university: 'Test University',
        year: 2024
      };

      // Mock successful issuance service response
      fetch.mockResolvedValue(
        new Response(JSON.stringify({
          success: true,
          credential: {
            id: 'test-id',
            data: credentialData,
            issuedBy: 'worker-1',
            issuedAt: '2024-01-01T00:00:00.000Z'
          },
          alreadyIssued: true
        }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      );

      const response = await request(app)
        .post('/api/verification/verify')
        .send({ credentialData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('valid');
      expect(response.body.message).toContain('valid');
      expect(response.body).toHaveProperty('verifiedBy');
      expect(response.body).toHaveProperty('verifiedAt');
      expect(response.body).toHaveProperty('issuedBy');
      expect(response.body).toHaveProperty('issuedAt');
    });

    it('should mark credential as invalid if not found', async () => {
      const credentialData = {
        name: 'Jane Smith',
        degree: 'Invalid Degree'
      };

      // Mock issuance service response for non-existent credential
      fetch.mockResolvedValue(
        new Response(JSON.stringify({
          success: false
        }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      );

      const response = await request(app)
        .post('/api/verification/verify')
        .send({ credentialData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('invalid');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for missing credentialData', async () => {
      const response = await request(app)
        .post('/api/verification/verify')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('credentialData is required');
    });

    it('should return 400 for invalid credentialData type', async () => {
      const response = await request(app)
        .post('/api/verification/verify')
        .send({ credentialData: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('must be an object');
    });

    it('should return 503 when issuance service is unavailable', async () => {
      const credentialData = {
        name: 'Test User'
      };

      // Mock network error
      fetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .post('/api/verification/verify')
        .send({ credentialData })
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Service temporarily unavailable');
    });
  });

  describe('GET /api/verification/worker', () => {
    it('should return worker information', async () => {
      const response = await request(app)
        .get('/api/verification/worker')
        .expect(200);

      expect(response.body).toHaveProperty('workerId');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /', () => {
    it('should return service information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
});