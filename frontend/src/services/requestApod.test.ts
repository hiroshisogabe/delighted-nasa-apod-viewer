import { describe, expect, it, vi } from 'vitest';
import { requestDailyApod, requestRandomApod } from './requestApod';

interface MockFetchResponseOptions {
  ok: boolean;
  body: unknown;
}

const createMockResponse = (options: MockFetchResponseOptions): Response => {
  return {
    ok: options.ok,
    json: async () => options.body
  } as Response;
};

const createFetchImplementation = (options: MockFetchResponseOptions): typeof fetch => {
  return vi.fn(async (_input: RequestInfo | URL) => {
    return createMockResponse(options);
  }) as unknown as typeof fetch;
};

describe('requestApod', () => {
  it('requests and maps daily APOD success payload', async () => {
    const fetchImplementation = createFetchImplementation({
      ok: true,
      body: {
        title: 'Daily APOD',
        date: '2026-03-03',
        explanation: 'A daily image',
        imageUrl: 'https://example.com/daily.jpg'
      }
    });

    const result = await requestDailyApod({ fetchImplementation });

    expect(result).toEqual({
      type: 'success',
      data: {
        title: 'Daily APOD',
        date: '2026-03-03',
        explanation: 'A daily image',
        imageUrl: 'https://example.com/daily.jpg'
      }
    });
    expect(fetchImplementation).toHaveBeenCalledWith('/api/apod/daily');
  });

  it('requests and maps random APOD success payload', async () => {
    const fetchImplementation = createFetchImplementation({
      ok: true,
      body: {
        title: 'Random APOD',
        date: '2026-03-04',
        explanation: 'A random image',
        imageUrl: 'https://example.com/random.jpg',
        copyright: 'NASA'
      }
    });

    const result = await requestRandomApod({ fetchImplementation });

    expect(result).toEqual({
      type: 'success',
      data: {
        title: 'Random APOD',
        date: '2026-03-04',
        explanation: 'A random image',
        imageUrl: 'https://example.com/random.jpg',
        copyright: 'NASA'
      }
    });
    expect(fetchImplementation).toHaveBeenCalledWith('/api/apod/random');
  });

  it('maps RATE_LIMIT_REACHED backend code to friendly error result', async () => {
    const fetchImplementation = createFetchImplementation({
      ok: false,
      body: {
        errorCode: 'RATE_LIMIT_REACHED',
        message: 'ignored'
      }
    });

    const result = await requestDailyApod({ fetchImplementation });

    expect(result).toEqual({
      type: 'error',
      error: {
        errorCode: 'RATE_LIMIT_REACHED',
        message: 'The rate limit was reached'
      }
    });
  });

  it('maps unknown backend failures to TRY_AGAIN', async () => {
    const fetchImplementation = createFetchImplementation({
      ok: false,
      body: {
        errorCode: 'UNKNOWN_ERROR',
        message: 'ignored'
      }
    });

    const result = await requestRandomApod({ fetchImplementation });

    expect(result).toEqual({
      type: 'error',
      error: {
        errorCode: 'TRY_AGAIN',
        message: 'Try again'
      }
    });
  });

  it('maps malformed success payloads to TRY_AGAIN', async () => {
    const fetchImplementation = createFetchImplementation({
      ok: true,
      body: {
        title: 'Missing fields'
      }
    });

    const result = await requestDailyApod({ fetchImplementation });

    expect(result).toEqual({
      type: 'error',
      error: {
        errorCode: 'TRY_AGAIN',
        message: 'Try again'
      }
    });
  });

  it('maps fetch exceptions to TRY_AGAIN', async () => {
    const fetchImplementation = vi.fn(async (_input: RequestInfo | URL) => {
      throw new Error('Network down');
    }) as unknown as typeof fetch;

    const result = await requestRandomApod({ fetchImplementation });

    expect(result).toEqual({
      type: 'error',
      error: {
        errorCode: 'TRY_AGAIN',
        message: 'Try again'
      }
    });
  });
});
