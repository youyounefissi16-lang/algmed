import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

const get = (url) => request(app).get(url);

describe('Case listing access', () => {
  it('returns 401 without a token for GET /api/cases', async () => {
    const res = await get('/api/cases');
    expect(res.status).toBe(401);
  });

  it('returns 401 without a token for GET /api/cases/:id', async () => {
    const res = await get('/api/cases/507f1f77bcf86cd799439011');
    expect(res.status).toBe(401);
  });
});
