import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { requestDailyApod, requestRandomApod } from './services/requestApod';

vi.mock('./services/requestApod', () => {
  return {
    requestDailyApod: vi.fn(),
    requestRandomApod: vi.fn()
  };
});

const mockedRequestDailyApod = vi.mocked(requestDailyApod);
const mockedRequestRandomApod = vi.mocked(requestRandomApod);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders exactly two APOD action buttons and no APOD content initially', () => {
    render(<App />);

    const dailyButton = screen.getByRole('button', { name: 'Picture of the Day' });
    const randomButton = screen.getByRole('button', { name: 'Random Picture' });

    expect(dailyButton).toBeDefined();
    expect(randomButton).toBeDefined();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders success state when daily request succeeds', async () => {
    mockedRequestDailyApod.mockResolvedValue({
      type: 'success',
      data: {
        title: 'Daily APOD',
        date: '2026-03-05',
        explanation: 'Daily explanation',
        imageUrl: 'https://example.com/daily.jpg'
      }
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Picture of the Day' }));

    await waitFor(() => {
      expect(mockedRequestDailyApod).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('heading', { name: 'Daily APOD' })).toBeDefined();
    expect(screen.getByRole('img', { name: 'Daily APOD' })).toBeDefined();
    expect(screen.getByText('2026-03-05')).toBeDefined();
    expect(screen.getByText('Daily explanation')).toBeDefined();
  });

  it('renders success state when random request succeeds', async () => {
    mockedRequestRandomApod.mockResolvedValue({
      type: 'success',
      data: {
        title: 'Random APOD',
        date: '2026-03-06',
        explanation: 'Random explanation',
        imageUrl: 'https://example.com/random.jpg'
      }
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Random Picture' }));

    await waitFor(() => {
      expect(mockedRequestRandomApod).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('heading', { name: 'Random APOD' })).toBeDefined();
    expect(screen.getByRole('img', { name: 'Random APOD' })).toBeDefined();
    expect(screen.getByText('2026-03-06')).toBeDefined();
    expect(screen.getByText('Random explanation')).toBeDefined();
  });

  it('renders rate-limit message when backend returns RATE_LIMIT_REACHED', async () => {
    mockedRequestDailyApod.mockResolvedValue({
      type: 'error',
      error: {
        errorCode: 'RATE_LIMIT_REACHED',
        message: 'The rate limit was reached'
      }
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Picture of the Day' }));

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toBe('The rate limit was reached');
  });

  it('renders generic retry message when backend returns TRY_AGAIN', async () => {
    mockedRequestRandomApod.mockResolvedValue({
      type: 'error',
      error: {
        errorCode: 'TRY_AGAIN',
        message: 'Try again'
      }
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Random Picture' }));

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toBe('Try again');
  });
});
