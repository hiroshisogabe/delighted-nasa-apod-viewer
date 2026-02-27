import request from 'supertest';
import { createApp } from './app';

describe('GET /test', () => {
  it('returns 200 with running status and ISO timestamp', async () => {
    const app = createApp();

    const response = await request(app).get('/test');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('Running');
    expect(typeof response.body.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });

  it('returns 500 when an unexpected error happens', async () => {
    const app = createApp();

    const response = await request(app).get('/test?fail=true');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Unexpected error',
      message: 'Forced failure'
    });
  });
});

describe('Not found routes', () => {
  it('returns 404 with error contract', async () => {
    const app = createApp();

    const response = await request(app).get('/missing-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Not found',
      message: 'Route not found'
    });
  });
});
