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

const createImageSuccessResult = (title: string, date: string, explanation: string, mediaUrl: string) => {
  return {
    type: 'success' as const,
    data: {
      title,
      date,
      explanation,
      mediaType: 'image' as const,
      mediaUrl
    }
  };
};

const createVideoSuccessResult = (title: string, date: string, explanation: string, mediaUrl: string) => {
  return {
    type: 'success' as const,
    data: {
      title,
      date,
      explanation,
      mediaType: 'video' as const,
      mediaUrl,
      thumbnailUrl: 'https://example.com/poster.jpg'
    }
  };
};

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
    expect(document.querySelector('video')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders image success state when daily request succeeds', async () => {
    mockedRequestDailyApod.mockResolvedValue(
      createImageSuccessResult('Daily APOD', '2026-03-05', 'Daily explanation', 'https://example.com/daily.jpg')
    );

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

  it('renders video success state with required playback attributes', async () => {
    mockedRequestRandomApod.mockResolvedValue(
      createVideoSuccessResult('Random APOD', '2026-03-06', 'Random explanation', 'https://example.com/random.mp4')
    );

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Random Picture' }));

    await waitFor(() => {
      expect(mockedRequestRandomApod).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('heading', { name: 'Random APOD' })).toBeDefined();
    const videoElement = screen.getByLabelText('Random APOD video') as HTMLVideoElement;

    expect(videoElement).toBeDefined();
    expect(videoElement.autoplay).toBe(true);
    expect(videoElement.controls).toBe(true);
    expect(videoElement.muted).toBe(true);
    expect(videoElement.playsInline).toBe(true);
    expect(videoElement.tabIndex).toBe(0);
    videoElement.focus();
    expect(document.activeElement).toBe(videoElement);
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

  it('renders unsupported-media message when backend returns MEDIA_TYPE_UNSUPPORTED', async () => {
    mockedRequestDailyApod.mockResolvedValue({
      type: 'error',
      error: {
        errorCode: 'MEDIA_TYPE_UNSUPPORTED',
        message: 'The APOD media type is not supported'
      }
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Picture of the Day' }));

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toBe('The APOD media type is not supported');
  });

  it('shows native playback error message when video playback fails', async () => {
    mockedRequestDailyApod.mockResolvedValue(
      createVideoSuccessResult('Daily APOD', '2026-03-05', 'Daily explanation', 'https://example.com/daily.mp4')
    );

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Picture of the Day' }));

    const videoElement = await screen.findByLabelText('Daily APOD video');

    Object.defineProperty(videoElement, 'error', {
      configurable: true,
      value: {
        message: 'Native playback failed',
        code: 3
      } satisfies MediaError
    });

    fireEvent.error(videoElement);

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toBe('Native playback failed');
    expect(screen.queryByLabelText('Daily APOD video')).toBeNull();
  });

  it('shows generic playback fallback when no native playback message is available', async () => {
    mockedRequestDailyApod.mockResolvedValue(
      createVideoSuccessResult('Daily APOD', '2026-03-05', 'Daily explanation', 'https://example.com/daily.mp4')
    );

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Picture of the Day' }));

    const videoElement = await screen.findByLabelText('Daily APOD video');

    Object.defineProperty(videoElement, 'error', {
      configurable: true,
      value: {
        message: '',
        code: 3
      } satisfies MediaError
    });

    fireEvent.error(videoElement);

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toBe('Video playback failed. Try again with another APOD item.');
    expect(screen.queryByLabelText('Daily APOD video')).toBeNull();
  });
});
