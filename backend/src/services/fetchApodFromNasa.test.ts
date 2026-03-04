import { fetchDailyApodFromNasa, fetchRandomApodFromNasa } from './fetchApodFromNasa';
import { NasaApiRequestError } from '../types/apod';

interface MockHttpResponse {
  ok: boolean;
  status: number;
  body: unknown;
}

const createMockHttpClient = (response: MockHttpResponse) => {
  return jest.fn(async (_url: string) => {
    return {
      ok: response.ok,
      status: response.status,
      json: async () => response.body
    };
  });
};

describe('fetchApodFromNasa mode behavior', () => {
  it('builds a daily request URL without count parameter', async () => {
    const mockHttpClient = createMockHttpClient({
      ok: true,
      status: 200,
      body: { title: 'Daily APOD' }
    });

    await fetchDailyApodFromNasa({
      apiKey: 'demo-key',
      baseUrl: 'https://example.com',
      httpClient: mockHttpClient
    });

    const requestedUrl = new URL(mockHttpClient.mock.calls[0][0]);

    expect(requestedUrl.pathname).toBe('/planetary/apod');
    expect(requestedUrl.searchParams.get('api_key')).toBe('demo-key');
    expect(requestedUrl.searchParams.get('count')).toBeNull();
  });

  it('builds a random request URL with count=1', async () => {
    const mockHttpClient = createMockHttpClient({
      ok: true,
      status: 200,
      body: [{ title: 'Random APOD' }]
    });

    await fetchRandomApodFromNasa({
      apiKey: 'demo-key',
      baseUrl: 'https://example.com',
      httpClient: mockHttpClient
    });

    const requestedUrl = new URL(mockHttpClient.mock.calls[0][0]);

    expect(requestedUrl.pathname).toBe('/planetary/apod');
    expect(requestedUrl.searchParams.get('api_key')).toBe('demo-key');
    expect(requestedUrl.searchParams.get('count')).toBe('1');
  });
});

describe('fetchApodFromNasa failures', () => {
  it('throws NasaApiRequestError for NASA non-OK responses', async () => {
    const mockHttpClient = createMockHttpClient({
      ok: false,
      status: 429,
      body: {}
    });

    await expect(
      fetchDailyApodFromNasa({
        apiKey: 'demo-key',
        baseUrl: 'https://example.com',
        httpClient: mockHttpClient
      })
    ).rejects.toEqual(
      expect.objectContaining({
        name: 'NasaApiRequestError',
        source: 'NASA',
        statusCode: 429
      })
    );
  });

  it('wraps thrown errors as internal NasaApiRequestError', async () => {
    const mockHttpClient = jest.fn(async (_url: string) => {
      throw new Error('Socket timeout');
    });

    await expect(
      fetchDailyApodFromNasa({
        apiKey: 'demo-key',
        baseUrl: 'https://example.com',
        httpClient: mockHttpClient
      })
    ).rejects.toEqual(
      expect.objectContaining({
        name: 'NasaApiRequestError',
        source: 'INTERNAL',
        statusCode: undefined
      })
    );
  });

  it('throws when API key is blank', async () => {
    const mockHttpClient = createMockHttpClient({
      ok: true,
      status: 200,
      body: {}
    });

    await expect(
      fetchDailyApodFromNasa({
        apiKey: '   ',
        baseUrl: 'https://example.com',
        httpClient: mockHttpClient
      })
    ).rejects.toThrow('NASA API key is required');
  });
});

describe('APOD service integration behavior', () => {
  it('returns daily payload and preserves structure for downstream mapping', async () => {
    const payload = {
      title: 'Daily APOD',
      date: '2026-01-20',
      explanation: 'Integration check',
      media_type: 'image',
      url: 'https://example.com/daily.jpg'
    };
    const mockHttpClient = createMockHttpClient({
      ok: true,
      status: 200,
      body: payload
    });

    const result = await fetchDailyApodFromNasa({
      apiKey: 'demo-key',
      baseUrl: 'https://example.com',
      httpClient: mockHttpClient
    });

    expect(result).toEqual(payload);
  });

  it('returns random payload array and preserves structure for downstream mapping', async () => {
    const payload = [
      {
        title: 'Random APOD',
        date: '2026-01-21',
        explanation: 'Integration check',
        media_type: 'image',
        url: 'https://example.com/random.jpg'
      }
    ];
    const mockHttpClient = createMockHttpClient({
      ok: true,
      status: 200,
      body: payload
    });

    const result = await fetchRandomApodFromNasa({
      apiKey: 'demo-key',
      baseUrl: 'https://example.com',
      httpClient: mockHttpClient
    });

    expect(result).toEqual(payload);
  });
});
