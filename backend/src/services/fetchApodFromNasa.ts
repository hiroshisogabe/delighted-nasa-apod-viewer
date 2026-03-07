import { NasaApiRequestError } from '../types/apod';

const APOD_ENDPOINT_PATH = '/planetary/apod';
const DEFAULT_NASA_BASE_URL = 'https://api.nasa.gov';
const RANDOM_IMAGE_COUNT = 1;
const APOD_VIDEO_THUMBNAILS_ENABLED = true;

interface NasaHttpResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

type NasaHttpClient = (url: string) => Promise<NasaHttpResponse>;

interface FetchApodFromNasaOptions {
  apiKey: string;
  baseUrl?: string;
  httpClient?: NasaHttpClient;
}

const createDefaultHttpClient = (): NasaHttpClient => {
  return async (url: string): Promise<NasaHttpResponse> => {
    const response = await fetch(url);

    return {
      ok: response.ok,
      status: response.status,
      json: async () => response.json()
    };
  };
};

const createApiKeyParam = (apiKey: string): string => {
  if (apiKey.trim().length > 0) {
    return apiKey;
  }

  throw new Error('NASA API key is required');
};

const createRequestUrl = (options: {
  apiKey: string;
  baseUrl: string;
  count?: number;
  thumbs?: boolean;
}): string => {
  const requestUrl = new URL(APOD_ENDPOINT_PATH, options.baseUrl);

  requestUrl.searchParams.set('api_key', createApiKeyParam(options.apiKey));

  if (options.count !== undefined) {
    requestUrl.searchParams.set('count', options.count.toString());
  }

  if (options.thumbs) {
    requestUrl.searchParams.set('thumbs', 'true');
  }

  return requestUrl.toString();
};

const requestApodFromNasa = async (options: {
  apiKey: string;
  baseUrl?: string;
  count?: number;
  thumbs?: boolean;
  httpClient?: NasaHttpClient;
}): Promise<unknown> => {
  const baseUrl = options.baseUrl ?? DEFAULT_NASA_BASE_URL;
  const requestUrl = createRequestUrl({
    apiKey: options.apiKey,
    baseUrl,
    count: options.count,
    thumbs: options.thumbs
  });
  const httpClient = options.httpClient ?? createDefaultHttpClient();

  try {
    const response = await httpClient(requestUrl);

    if (!response.ok) {
      throw new NasaApiRequestError('NASA APOD request failed', {
        source: 'NASA',
        statusCode: response.status
      });
    }

    return response.json();
  } catch (error: unknown) {
    if (error instanceof NasaApiRequestError) {
      throw error;
    }

    throw new NasaApiRequestError('NASA APOD request failed', {
      source: 'INTERNAL'
    });
  }
};

export const fetchDailyApodFromNasa = async (
  options: FetchApodFromNasaOptions
): Promise<unknown> => {
  return requestApodFromNasa({
    ...options,
    thumbs: APOD_VIDEO_THUMBNAILS_ENABLED
  });
};

export const fetchRandomApodFromNasa = async (
  options: FetchApodFromNasaOptions
): Promise<unknown> => {
  return requestApodFromNasa({
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
    httpClient: options.httpClient,
    count: RANDOM_IMAGE_COUNT,
    thumbs: APOD_VIDEO_THUMBNAILS_ENABLED
  });
};
