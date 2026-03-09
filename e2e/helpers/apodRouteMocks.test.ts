import { expect, Page, test } from '@playwright/test';
import {
  ApodRouteSet,
  createBrokenVideoSuccessResponse,
  createDailyImageSuccessResponse,
  createDailyVideoSuccessResponse,
  createRandomImageSuccessResponse,
  createRandomVideoSuccessResponse,
  createRateLimitFailureResponse,
  createTryAgainFailureResponse,
  createUnsupportedMediaFailureResponse,
  mockApodRoutes
} from './apodRouteMocks';

interface CapturedFulfillResponse {
  status: number;
  contentType: string;
  body: string;
}

interface CapturedRouteRegistration {
  pattern: string;
  handler: (route: { fulfill: (response: CapturedFulfillResponse) => Promise<void> }) => Promise<void>;
}

test('creates deterministic image and video success fixtures', () => {
  const dailyImageResponse = createDailyImageSuccessResponse();
  const randomImageResponse = createRandomImageSuccessResponse();
  const dailyVideoResponse = createDailyVideoSuccessResponse();
  const randomVideoResponse = createRandomVideoSuccessResponse();
  const brokenVideoResponse = createBrokenVideoSuccessResponse();

  expect(dailyImageResponse.status).toBe(200);
  expect(dailyImageResponse.body).toEqual({
    title: 'Blue Marble 2026',
    date: '2026-03-03',
    explanation: 'A clear Earth view from space.',
    mediaType: 'image',
    mediaUrl: 'https://example.com/daily-apod.jpg',
    copyright: 'NASA'
  });

  expect(randomImageResponse.status).toBe(200);
  expect(randomImageResponse.body).toEqual({
    title: 'Orion Nebula',
    date: '2026-02-24',
    explanation: 'A colorful nebula in deep space.',
    mediaType: 'image',
    mediaUrl: 'https://example.com/random-apod.jpg'
  });

  expect(dailyVideoResponse.status).toBe(200);
  expect(dailyVideoResponse.body).toEqual({
    title: 'Moonrise Over Earth',
    date: '2026-03-04',
    explanation: 'A cinematic Earthrise captured from lunar orbit.',
    mediaType: 'video',
    mediaUrl: 'https://example.com/daily-apod.mp4',
    thumbnailUrl: 'https://example.com/daily-apod.jpg',
    copyright: 'NASA'
  });

  expect(randomVideoResponse.status).toBe(200);
  expect(randomVideoResponse.body).toEqual({
    title: 'Solar Corona Stream',
    date: '2026-02-25',
    explanation: 'Fast plasma structures captured in coronagraph imagery.',
    mediaType: 'video',
    mediaUrl: 'https://example.com/random-apod.webm',
    thumbnailUrl: 'https://example.com/random-apod.jpg'
  });

  expect(brokenVideoResponse.status).toBe(200);
  expect(brokenVideoResponse.body).toEqual({
    title: 'Corrupted Signal',
    date: '2026-03-02',
    explanation: 'This clip is intentionally unavailable for fallback validation.',
    mediaType: 'video',
    mediaUrl: 'https://example.com/broken-video.mp4'
  });
});

test('creates deterministic failure fixtures', () => {
  const rateLimitResponse = createRateLimitFailureResponse();
  const tryAgainResponse = createTryAgainFailureResponse();
  const unsupportedMediaResponse = createUnsupportedMediaFailureResponse();

  expect(rateLimitResponse).toEqual({
    status: 502,
    body: {
      errorCode: 'RATE_LIMIT_REACHED',
      message: 'The rate limit was reached'
    }
  });

  expect(tryAgainResponse).toEqual({
    status: 502,
    body: {
      errorCode: 'TRY_AGAIN',
      message: 'Try again'
    }
  });

  expect(unsupportedMediaResponse).toEqual({
    status: 502,
    body: {
      errorCode: 'MEDIA_TYPE_UNSUPPORTED',
      message: 'The APOD media type is not supported'
    }
  });
});

test('registers and fulfills both APOD routes', async () => {
  const registrations: CapturedRouteRegistration[] = [];
  const routeSet: ApodRouteSet = {
    daily: createDailyImageSuccessResponse(),
    random: createTryAgainFailureResponse()
  };
  const fakePage = {
    route: async (
      pattern: string,
      handler: (route: { fulfill: (response: CapturedFulfillResponse) => Promise<void> }) => Promise<void>
    ) => {
      registrations.push({ pattern, handler });
    }
  };

  await mockApodRoutes(fakePage as unknown as Page, routeSet);

  expect(registrations).toHaveLength(2);
  expect(registrations[0].pattern).toBe('**/api/apod/daily');
  expect(registrations[1].pattern).toBe('**/api/apod/random');

  const fulfilledDailyResponses: CapturedFulfillResponse[] = [];
  await registrations[0].handler({
    fulfill: async (response: CapturedFulfillResponse) => {
      fulfilledDailyResponses.push(response);
    }
  });

  const fulfilledRandomResponses: CapturedFulfillResponse[] = [];
  await registrations[1].handler({
    fulfill: async (response: CapturedFulfillResponse) => {
      fulfilledRandomResponses.push(response);
    }
  });

  expect(fulfilledDailyResponses).toHaveLength(1);
  expect(fulfilledDailyResponses[0].status).toBe(200);
  expect(fulfilledDailyResponses[0].contentType).toBe('application/json');
  expect(JSON.parse(fulfilledDailyResponses[0].body) as unknown).toEqual(routeSet.daily.body);

  expect(fulfilledRandomResponses).toHaveLength(1);
  expect(fulfilledRandomResponses[0].status).toBe(502);
  expect(fulfilledRandomResponses[0].contentType).toBe('application/json');
  expect(JSON.parse(fulfilledRandomResponses[0].body) as unknown).toEqual(routeSet.random.body);
});
