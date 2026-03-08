import { expect, test } from '@playwright/test';
import {
  createBrokenVideoSuccessResponse,
  createDailyImageSuccessResponse,
  createDailyVideoSuccessResponse,
  createRandomImageSuccessResponse,
  createRandomVideoSuccessResponse,
  createRateLimitFailureResponse,
  createTryAgainFailureResponse,
  createUnsupportedMediaFailureResponse,
  mockApodRoutes
} from './helpers/apodRouteMocks';

test('shows two actions and no APOD content on initial load', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailyImageSuccessResponse(),
    random: createRandomImageSuccessResponse()
  });

  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Picture of the Day' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Random Picture' })).toBeVisible();
  await expect(page.locator('img')).toHaveCount(0);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('renders daily image APOD success state', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailyImageSuccessResponse(),
    random: createRandomImageSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Picture of the Day' }).click();

  await expect(page.getByRole('heading', { name: 'Blue Marble 2026' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Blue Marble 2026' })).toBeVisible();
  await expect(page.getByText('2026-03-03')).toBeVisible();
  await expect(page.getByText('A clear Earth view from space.')).toBeVisible();
});

test('renders random image APOD success state', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailyImageSuccessResponse(),
    random: createRandomImageSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Random Picture' }).click();

  await expect(page.getByRole('heading', { name: 'Orion Nebula' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Orion Nebula' })).toBeVisible();
  await expect(page.getByText('2026-02-24')).toBeVisible();
  await expect(page.getByText('A colorful nebula in deep space.')).toBeVisible();
});

test('renders daily video APOD success state with required playback behavior', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailyVideoSuccessResponse(),
    random: createRandomImageSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Picture of the Day' }).click();

  await expect(page.getByRole('heading', { name: 'Moonrise Over Earth' })).toBeVisible();
  await expect(page.getByText('2026-03-04')).toBeVisible();
  await expect(page.getByText('A cinematic Earthrise captured from lunar orbit.')).toBeVisible();

  const videoElement = page.getByLabel('Moonrise Over Earth video');
  await expect(videoElement).toBeVisible();
  await expect(videoElement).toHaveAttribute('autoplay', '');
  await expect(videoElement).toHaveAttribute('playsinline', '');
  await expect(videoElement).toHaveAttribute('controls', '');
  await expect(videoElement).toHaveAttribute('poster', 'https://example.com/daily-apod.jpg');

  const hasExpectedProperties = await videoElement.evaluate((videoNode: HTMLVideoElement) => {
    return {
      controls: videoNode.controls,
      muted: videoNode.muted,
      playsInline: videoNode.playsInline,
      tabIndex: videoNode.tabIndex
    };
  });

  expect(hasExpectedProperties.controls).toBe(true);
  expect(hasExpectedProperties.muted).toBe(true);
  expect(hasExpectedProperties.playsInline).toBe(true);
  expect(hasExpectedProperties.tabIndex).toBe(0);
});

test('renders random video APOD success state with required playback behavior', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailyImageSuccessResponse(),
    random: createRandomVideoSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Random Picture' }).click();

  await expect(page.getByRole('heading', { name: 'Solar Corona Stream' })).toBeVisible();
  await expect(page.getByText('2026-02-25')).toBeVisible();
  await expect(page.getByText('Fast plasma structures captured in coronagraph imagery.')).toBeVisible();

  const videoElement = page.getByLabel('Solar Corona Stream video');
  await expect(videoElement).toBeVisible();
  await expect(videoElement).toHaveAttribute('autoplay', '');
  await expect(videoElement).toHaveAttribute('playsinline', '');
  await expect(videoElement).toHaveAttribute('controls', '');
  await expect(videoElement).toHaveAttribute('poster', 'https://example.com/random-apod.jpg');

  const hasExpectedProperties = await videoElement.evaluate((videoNode: HTMLVideoElement) => {
    return {
      controls: videoNode.controls,
      muted: videoNode.muted,
      playsInline: videoNode.playsInline,
      tabIndex: videoNode.tabIndex
    };
  });

  expect(hasExpectedProperties.controls).toBe(true);
  expect(hasExpectedProperties.muted).toBe(true);
  expect(hasExpectedProperties.playsInline).toBe(true);
  expect(hasExpectedProperties.tabIndex).toBe(0);
});

test('renders unsupported-media message for backend MEDIA_TYPE_UNSUPPORTED failures', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createUnsupportedMediaFailureResponse(),
    random: createRandomImageSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Picture of the Day' }).click();

  await expect(page.getByRole('alert')).toHaveText('The APOD media type is not supported');
});

test('renders rate-limit message for daily failures', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createRateLimitFailureResponse(),
    random: createRandomImageSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Picture of the Day' }).click();

  await expect(page.getByRole('alert')).toHaveText('The rate limit was reached');
});

test('renders generic retry message for random failures', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailyImageSuccessResponse(),
    random: createTryAgainFailureResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Random Picture' }).click();

  await expect(page.getByRole('alert')).toHaveText('Try again');
});

test('renders frontend video playback fallback message when runtime playback fails', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createBrokenVideoSuccessResponse(),
    random: createRandomImageSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Picture of the Day' }).click();

  await expect(page.getByRole('heading', { name: 'Corrupted Signal' })).toBeVisible();
  const videoElement = page.getByLabel('Corrupted Signal video');
  await expect(videoElement).toBeVisible();

  await videoElement.evaluate((node: HTMLVideoElement) => {
    Object.defineProperty(node, 'error', {
      configurable: true,
      value: {
        message: '',
        code: 3
      }
    });
    node.dispatchEvent(new Event('error'));
  });

  await expect(page.getByRole('alert')).toHaveText('Video playback failed. Try again with another APOD item.');
  await expect(page.locator('video')).toHaveCount(0);
});
