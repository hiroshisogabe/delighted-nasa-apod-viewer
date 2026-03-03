import request from 'supertest';
import { createApp } from './app';

interface MockFetchResponseOptions {
  ok: boolean;
  status: number;
  body: unknown;
}

const createMockFetchResponse = (options: MockFetchResponseOptions): Response => {
  return {
    ok: options.ok,
    status: options.status,
    json: async () => options.body
  } as Response;
};

const setMockFetch = (responses: MockFetchResponseOptions[]): jest.Mock => {
  const mockFetch = jest.fn();

  responses.forEach((response) => {
    mockFetch.mockResolvedValueOnce(createMockFetchResponse(response));
  });

  Object.defineProperty(globalThis, 'fetch', {
    writable: true,
    value: mockFetch
  });

  return mockFetch;
};

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

describe('APOD routes', () => {
  const previousNasaApiKey = process.env.NASA_API_KEY;
  const previousFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.NASA_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env.NASA_API_KEY = previousNasaApiKey;
    Object.defineProperty(globalThis, 'fetch', {
      writable: true,
      value: previousFetch
    });
  });

  it('returns normalized daily APOD payload', async () => {
    const app = createApp();
    const mockFetch = setMockFetch([
      {
        ok: true,
        status: 200,
        body: {
          title: 'Daily image',
          date: '2026-03-01',
          explanation: 'Daily explanation',
          media_type: 'image',
          url: 'https://example.com/daily.jpg',
          copyright: 'NASA'
        }
      }
    ]);

    const response = await request(app).get('/api/apod/daily');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      title: 'Daily image',
      date: '2026-03-01',
      explanation: 'Daily explanation',
      imageUrl: 'https://example.com/daily.jpg',
      copyright: 'NASA'
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns normalized random APOD payload', async () => {
    const app = createApp();
    const mockFetch = setMockFetch([
      {
        ok: true,
        status: 200,
        body: [
          {
            title: 'Random image',
            date: '2026-03-02',
            explanation: 'Random explanation',
            media_type: 'image',
            url: 'https://example.com/random.jpg'
          }
        ]
      }
    ]);

    const response = await request(app).get('/api/apod/random');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      title: 'Random image',
      date: '2026-03-02',
      explanation: 'Random explanation',
      imageUrl: 'https://example.com/random.jpg'
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns RATE_LIMIT_REACHED when NASA responds with 429', async () => {
    const app = createApp();
    setMockFetch([
      {
        ok: false,
        status: 429,
        body: {}
      }
    ]);

    const response = await request(app).get('/api/apod/daily');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      errorCode: 'RATE_LIMIT_REACHED',
      message: 'The rate limit was reached'
    });
  });

  it('returns TRY_AGAIN when payload is not image media', async () => {
    const app = createApp();
    setMockFetch([
      {
        ok: true,
        status: 200,
        body: {
          title: 'Video entry',
          date: '2026-03-02',
          explanation: 'Not supported',
          media_type: 'video',
          url: 'https://example.com/video.mp4'
        }
      }
    ]);

    const response = await request(app).get('/api/apod/daily');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      errorCode: 'TRY_AGAIN',
      message: 'Try again'
    });
  });

  it('returns TRY_AGAIN when upstream request throws unexpectedly', async () => {
    const app = createApp();
    const mockFetch = jest.fn(async () => {
      throw new Error('Network down');
    });

    Object.defineProperty(globalThis, 'fetch', {
      writable: true,
      value: mockFetch
    });

    const response = await request(app).get('/api/apod/random');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      errorCode: 'TRY_AGAIN',
      message: 'Try again'
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
