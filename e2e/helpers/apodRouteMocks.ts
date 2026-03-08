import { Page, Route } from '@playwright/test';

export type ApodErrorCode = 'RATE_LIMIT_REACHED' | 'TRY_AGAIN' | 'MEDIA_TYPE_UNSUPPORTED';
export type ApodMediaType = 'image' | 'video';

export interface ApodSuccessBody {
  title: string;
  date: string;
  explanation: string;
  mediaType: ApodMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  copyright?: string;
}

export interface ApodErrorBody {
  errorCode: ApodErrorCode;
  message: string;
}

export type ApodMockBody = ApodSuccessBody | ApodErrorBody;

export interface ApodRouteResponse {
  status: number;
  body: ApodMockBody;
}

export interface ApodRouteSet {
  daily: ApodRouteResponse;
  random: ApodRouteResponse;
}

const dailyRoutePattern = '**/api/apod/daily';
const randomRoutePattern = '**/api/apod/random';

const fulfillRouteWithResponse = async (route: Route, response: ApodRouteResponse): Promise<void> => {
  await route.fulfill({
    status: response.status,
    contentType: 'application/json',
    body: JSON.stringify(response.body)
  });
};

export const mockApodRoutes = async (page: Page, routeSet: ApodRouteSet): Promise<void> => {
  await page.route(dailyRoutePattern, async (route: Route) => {
    await fulfillRouteWithResponse(route, routeSet.daily);
  });

  await page.route(randomRoutePattern, async (route: Route) => {
    await fulfillRouteWithResponse(route, routeSet.random);
  });
};

export const createDailySuccessResponse = (): ApodRouteResponse => {
  return {
    status: 200,
    body: {
      title: 'Blue Marble 2026',
      date: '2026-03-03',
      explanation: 'A clear Earth view from space.',
      mediaType: 'image',
      mediaUrl: 'https://example.com/daily-apod.jpg',
      copyright: 'NASA'
    }
  };
};

export const createRandomSuccessResponse = (): ApodRouteResponse => {
  return {
    status: 200,
    body: {
      title: 'Orion Nebula',
      date: '2026-02-24',
      explanation: 'A colorful nebula in deep space.',
      mediaType: 'image',
      mediaUrl: 'https://example.com/random-apod.jpg'
    }
  };
};

export const createRateLimitFailureResponse = (): ApodRouteResponse => {
  return {
    status: 502,
    body: {
      errorCode: 'RATE_LIMIT_REACHED',
      message: 'The rate limit was reached'
    }
  };
};

export const createTryAgainFailureResponse = (): ApodRouteResponse => {
  return {
    status: 502,
    body: {
      errorCode: 'TRY_AGAIN',
      message: 'Try again'
    }
  };
};
