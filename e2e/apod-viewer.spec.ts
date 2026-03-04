import { expect, test } from '@playwright/test';
import {
  createDailySuccessResponse,
  createRandomSuccessResponse,
  createRateLimitFailureResponse,
  createTryAgainFailureResponse,
  mockApodRoutes
} from './helpers/apodRouteMocks';

test('shows two actions and no APOD content on initial load', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailySuccessResponse(),
    random: createRandomSuccessResponse()
  });

  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Picture of the Day' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Random Picture' })).toBeVisible();
  await expect(page.locator('img')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('renders daily APOD success state', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailySuccessResponse(),
    random: createRandomSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Picture of the Day' }).click();

  await expect(page.getByRole('heading', { name: 'Blue Marble 2026' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Blue Marble 2026' })).toBeVisible();
  await expect(page.getByText('2026-03-03')).toBeVisible();
  await expect(page.getByText('A clear Earth view from space.')).toBeVisible();
});

test('renders random APOD success state', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailySuccessResponse(),
    random: createRandomSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Random Picture' }).click();

  await expect(page.getByRole('heading', { name: 'Orion Nebula' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Orion Nebula' })).toBeVisible();
  await expect(page.getByText('2026-02-24')).toBeVisible();
  await expect(page.getByText('A colorful nebula in deep space.')).toBeVisible();
});

test('renders rate-limit message for daily failures', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createRateLimitFailureResponse(),
    random: createRandomSuccessResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Picture of the Day' }).click();

  await expect(page.getByRole('alert')).toHaveText('The rate limit was reached');
});

test('renders generic retry message for random failures', async ({ page }) => {
  await mockApodRoutes(page, {
    daily: createDailySuccessResponse(),
    random: createTryAgainFailureResponse()
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Random Picture' }).click();

  await expect(page.getByRole('alert')).toHaveText('Try again');
});
