import { ReactElement, SyntheticEvent, useState } from 'react';
import { requestDailyApod, requestRandomApod } from './services/requestApod';
import {
  ApodUiState,
  createErrorApodState,
  createIdleApodState,
  createLoadingApodState,
  createSuccessApodState
} from './types/apod';

const GENERIC_VIDEO_PLAYBACK_ERROR_MESSAGE = 'Video playback failed. Try again with another APOD item.';

const readVideoPlaybackErrorMessage = (videoElement: HTMLVideoElement): string | null => {
  const mediaError = videoElement.error;

  if (mediaError === null) {
    return null;
  }

  if (mediaError.message.trim().length > 0) {
    return mediaError.message;
  }

  return null;
};

const createVideoPlaybackErrorMessage = (videoElement: HTMLVideoElement): string => {
  const nativeMessage = readVideoPlaybackErrorMessage(videoElement);

  if (nativeMessage !== null) {
    return nativeMessage;
  }

  return GENERIC_VIDEO_PLAYBACK_ERROR_MESSAGE;
};

const renderMedia = (
  apodState: Extract<ApodUiState, { status: 'success' }>,
  videoPlaybackErrorMessage: string | null,
  handleVideoPlaybackError: (event: SyntheticEvent<HTMLVideoElement, Event>) => void
): ReactElement => {
  if (apodState.data.mediaType === 'image') {
    return <img className="apod-image" src={apodState.data.mediaUrl} alt={apodState.data.title} />;
  }

  if (videoPlaybackErrorMessage !== null) {
    return (
      <p role="alert" className="apod-media-error">
        {videoPlaybackErrorMessage}
      </p>
    );
  }

  return (
    <video
      className="apod-video"
      src={apodState.data.mediaUrl}
      poster={apodState.data.thumbnailUrl}
      controls
      autoPlay
      muted
      playsInline
      preload="metadata"
      tabIndex={0}
      onError={handleVideoPlaybackError}
      aria-label={`${apodState.data.title} video`}
    />
  );
};

const renderResult = (
  apodState: ApodUiState,
  videoPlaybackErrorMessage: string | null,
  handleVideoPlaybackError: (event: SyntheticEvent<HTMLVideoElement, Event>) => void
): ReactElement | null => {
  if (apodState.status === 'idle') {
    return null;
  }

  if (apodState.status === 'loading') {
    return <p className="apod-status">Loading media...</p>;
  }

  if (apodState.status === 'error') {
    return (
      <p role="alert" className="apod-error">
        {apodState.error.message}
      </p>
    );
  }

  return (
    <article className="apod-card">
      <h2 className="apod-title">{apodState.data.title}</h2>
      <p className="apod-date">{apodState.data.date}</p>
      <div className="apod-media">{renderMedia(apodState, videoPlaybackErrorMessage, handleVideoPlaybackError)}</div>
      <p className="apod-explanation">{apodState.data.explanation}</p>
      {apodState.data.copyright !== undefined && (
        <p className="apod-copyright">{apodState.data.copyright}</p>
      )}
    </article>
  );
};

export function App() {
  const [apodState, setApodState] = useState<ApodUiState>(createIdleApodState());
  const [videoPlaybackErrorMessage, setVideoPlaybackErrorMessage] = useState<string | null>(null);

  const handleVideoPlaybackError = (event: SyntheticEvent<HTMLVideoElement, Event>): void => {
    setVideoPlaybackErrorMessage(createVideoPlaybackErrorMessage(event.currentTarget));
  };

  const loadDailyApod = async (): Promise<void> => {
    setVideoPlaybackErrorMessage(null);
    setApodState(createLoadingApodState());

    const response = await requestDailyApod();

    if (response.type === 'success') {
      setApodState(createSuccessApodState(response.data));
      return;
    }

    setVideoPlaybackErrorMessage(null);
    setApodState(createErrorApodState(response.error));
  };

  const loadRandomApod = async (): Promise<void> => {
    setVideoPlaybackErrorMessage(null);
    setApodState(createLoadingApodState());

    const response = await requestRandomApod();

    if (response.type === 'success') {
      setApodState(createSuccessApodState(response.data));
      return;
    }

    setVideoPlaybackErrorMessage(null);
    setApodState(createErrorApodState(response.error));
  };

  const isLoading = apodState.status === 'loading';

  return (
    <main className="page">
      <section className="viewer" aria-label="NASA APOD Viewer">
        <h1 className="viewer-title">NASA APOD Explorer</h1>
        <p className="viewer-subtitle">Choose one option to load an image or video.</p>
        <div className="viewer-actions">
          <button type="button" onClick={loadDailyApod} disabled={isLoading}>
            Picture of the Day
          </button>
          <button type="button" onClick={loadRandomApod} disabled={isLoading}>
            Random Picture
          </button>
        </div>
        <section className="viewer-result" aria-live="polite" aria-label="APOD result">
          {renderResult(apodState, videoPlaybackErrorMessage, handleVideoPlaybackError)}
        </section>
      </section>
    </main>
  );
}
