import { ApodErrorCode, NasaApodUnsupportedMediaError, NasaApiRequestError } from '../types/apod';

const NASA_RATE_LIMIT_STATUS = 429;

export const classifyNasaFailure = (error: unknown): ApodErrorCode => {
  if (error instanceof NasaApodUnsupportedMediaError) {
    return 'MEDIA_TYPE_UNSUPPORTED';
  }

  if (!(error instanceof NasaApiRequestError)) {
    return 'TRY_AGAIN';
  }

  if (error.source !== 'NASA') {
    return 'TRY_AGAIN';
  }

  if (error.statusCode !== NASA_RATE_LIMIT_STATUS) {
    return 'TRY_AGAIN';
  }

  return 'RATE_LIMIT_REACHED';
};
