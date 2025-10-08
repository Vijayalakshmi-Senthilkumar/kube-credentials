import request from 'supertest';
import app from '../app';
import { db } from '../database/db';

describe('Issuance Service API', () => {
  beforeEach(() => {
    // Clear database before each test
    db.clearDatabase();
  });

  describe('GET /api/credentials/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/credentials/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'issuance-service');
      expect(response.body).toHaveProperty('workerId');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/credentials/issue', () => {
    it('should issue a new credential successfully', async () => {
      const credentialData = {
        name: 'John Doe',
        degree: 'Bachelor of Science',
        university: 'Test University',
        year: 2024
      };

      const response = await request(app)
        .post('/api/credentials/issue')
        .send({ credentialData })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Credential issued by');
      expect(response.body.credential).toHaveProperty('id');
      expect(response.body.credential).toHaveProperty('issuedBy');
      expect(response.body.credential).toHaveProperty('issuedAt');
      expect(response.body.credential.data).toEqual(credentialData);
      expect(response.body.alreadyIssued).toBe(false);
    });

    it('should return existing credential if already issued', async () => {
      const credentialData = {
        name: 'Jane Smith',
        degree: 'Master of Arts',
        university: 'Test University',
        year: 2024
      };

      // Issue credential first time
      await request(app)
        .post('/api/credentials/issue')
        .send({ credentialData })
        .expect(201);

      // Try to issue same credential again
      const response = await request(app)
        .post('/api/credentials/issue')
        .send({ credentialData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('already issued');
      expect(response.body.alreadyIssued).toBe(true);
    });

    it('should return 400 for missing credentialData', async () => {
      const response = await request(app)
        .post('/api/credentials/issue')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('credentialData is required');
    });

    it('should return 400 for invalid credentialData type', async () => {
      const response = await request(app)
        .post('/api/credentials/issue')
        .send({ credentialData: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('must be an object');
    });

    it('should generate different IDs for different credentials', async () => {
      const credential1 = {
        name: 'Alice',
        degree: 'PhD'
      };

      const credential2 = {
        name: 'Bob',
        degree: 'PhD'
      };

      const response1 = await request(app)
        .post('/api/credentials/issue')
        .send({ credentialData: credential1 })
        .expect(201);

      const response2 = await request(app)
        .post('/api/credentials/issue')
        .send({ credentialData: credential2 })
        .expect(201);

      expect(response1.body.credential.id).not.toBe(response2.body.credential.id);
    });
  });

  describe('GET /api/credentials/worker', () => {
    it('should return worker information', async () => {
      const response = await request(app)
        .get('/api/credentials/worker')
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

  describe('404 handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });
});