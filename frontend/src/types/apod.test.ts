import { describe, expect, it } from 'vitest';
import {
  createApodErrorMessage,
  createApodErrorResponse,
  createErrorApodState,
  createIdleApodState,
  createLoadingApodState,
  createSuccessApodState
} from './apod';

describe('apod state creators', () => {
  it('creates idle state with no data or error', () => {
    const state = createIdleApodState();

    expect(state).toEqual({
      status: 'idle',
      data: null,
      error: null
    });
  });

  it('creates loading state with no data or error', () => {
    const state = createLoadingApodState();

    expect(state).toEqual({
      status: 'loading',
      data: null,
      error: null
    });
  });

  it('creates success state with APOD data', () => {
    const state = createSuccessApodState({
      title: 'Daily APOD',
      date: '2026-03-03',
      explanation: 'A daily image',
      mediaType: 'image',
      mediaUrl: 'https://example.com/image.jpg'
    });

    expect(state).toEqual({
      status: 'success',
      data: {
        title: 'Daily APOD',
        date: '2026-03-03',
        explanation: 'A daily image',
        mediaType: 'image',
        mediaUrl: 'https://example.com/image.jpg'
      },
      error: null
    });
  });

  it('creates error state with mapped error payload', () => {
    const state = createErrorApodState(createApodErrorResponse('TRY_AGAIN'));

    expect(state).toEqual({
      status: 'error',
      data: null,
      error: {
        errorCode: 'TRY_AGAIN',
        message: 'Try again'
      }
    });
  });
});

describe('apod error mapping', () => {
  it('maps RATE_LIMIT_REACHED to exact message', () => {
    expect(createApodErrorMessage('RATE_LIMIT_REACHED')).toBe('The rate limit was reached');
  });

  it('maps TRY_AGAIN to exact message', () => {
    expect(createApodErrorMessage('TRY_AGAIN')).toBe('Try again');
  });

  it('maps MEDIA_TYPE_UNSUPPORTED to exact message', () => {
    expect(createApodErrorMessage('MEDIA_TYPE_UNSUPPORTED')).toBe('The APOD media type is not supported');
  });
});
