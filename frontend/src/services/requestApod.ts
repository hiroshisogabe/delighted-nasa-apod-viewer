import {
  ApodErrorCode,
  ApodImageResult,
  ApodRequestResult,
  createApodErrorResponse
} from '../types/apod';

const DAILY_APOD_ENDPOINT = '/api/apod/daily';
const RANDOM_APOD_ENDPOINT = '/api/apod/random';

interface RequestApodOptions {
  fetchImplementation?: typeof fetch;
}

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const readRequiredString = (payload: JsonRecord, fieldName: string): string | null => {
  const fieldValue = payload[fieldName];

  if (typeof fieldValue === 'string' && fieldValue.trim().length > 0) {
    return fieldValue;
  }

  return null;
};

const readErrorCode = (payload: unknown): ApodErrorCode => {
  if (!isRecord(payload)) {
    return 'TRY_AGAIN';
  }

  if (payload.errorCode === 'RATE_LIMIT_REACHED') {
    return 'RATE_LIMIT_REACHED';
  }

  return 'TRY_AGAIN';
};

const mapErrorResult = (payload: unknown): ApodRequestResult => {
  return {
    type: 'error',
    error: createApodErrorResponse(readErrorCode(payload))
  };
};

const mapSuccessResult = (payload: unknown): ApodRequestResult => {
  if (!isRecord(payload)) {
    return mapErrorResult({});
  }

  const title = readRequiredString(payload, 'title');
  const date = readRequiredString(payload, 'date');
  const explanation = readRequiredString(payload, 'explanation');
  const imageUrl = readRequiredString(payload, 'imageUrl');

  if (title === null || date === null || explanation === null || imageUrl === null) {
    return mapErrorResult({});
  }

  const result: ApodImageResult = {
    title,
    date,
    explanation,
    imageUrl
  };
  const copyrightValue = payload.copyright;

  if (typeof copyrightValue === 'string' && copyrightValue.trim().length > 0) {
    result.copyright = copyrightValue;
  }

  return {
    type: 'success',
    data: result
  };
};

const requestApod = async (endpoint: string, options?: RequestApodOptions): Promise<ApodRequestResult> => {
  const fetchImplementation = options?.fetchImplementation ?? fetch;

  try {
    const response = await fetchImplementation(endpoint);
    const payload = await response.json();

    if (response.ok) {
      return mapSuccessResult(payload);
    }

    return mapErrorResult(payload);
  } catch (_error: unknown) {
    return mapErrorResult({});
  }
};

export const requestDailyApod = async (options?: RequestApodOptions): Promise<ApodRequestResult> => {
  return requestApod(DAILY_APOD_ENDPOINT, options);
};

export const requestRandomApod = async (options?: RequestApodOptions): Promise<ApodRequestResult> => {
  return requestApod(RANDOM_APOD_ENDPOINT, options);
};
