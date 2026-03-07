import { classifyNasaFailure } from './classifyNasaFailure';
import { NasaApodUnsupportedMediaError, NasaApiRequestError } from '../types/apod';

describe('classifyNasaFailure', () => {
  it('returns RATE_LIMIT_REACHED for NASA 429 failures', () => {
    const classifiedError = classifyNasaFailure(
      new NasaApiRequestError('Rate limited', {
        source: 'NASA',
        statusCode: 429
      })
    );

    expect(classifiedError).toBe('RATE_LIMIT_REACHED');
  });

  it('returns TRY_AGAIN for non-429 NASA failures', () => {
    const classifiedError = classifyNasaFailure(
      new NasaApiRequestError('NASA unavailable', {
        source: 'NASA',
        statusCode: 500
      })
    );

    expect(classifiedError).toBe('TRY_AGAIN');
  });

  it('returns TRY_AGAIN for internal failures', () => {
    const classifiedError = classifyNasaFailure(
      new NasaApiRequestError('Network issue', {
        source: 'INTERNAL'
      })
    );

    expect(classifiedError).toBe('TRY_AGAIN');
  });

  it('returns TRY_AGAIN for unknown errors', () => {
    const classifiedError = classifyNasaFailure(new Error('Unexpected'));

    expect(classifiedError).toBe('TRY_AGAIN');
  });

  it('returns MEDIA_TYPE_UNSUPPORTED for unsupported media failures', () => {
    const classifiedError = classifyNasaFailure(
      new NasaApodUnsupportedMediaError('Unsupported APOD media')
    );

    expect(classifiedError).toBe('MEDIA_TYPE_UNSUPPORTED');
  });
});
