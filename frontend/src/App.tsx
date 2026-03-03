import { ReactElement, useState } from 'react';
import { requestDailyApod, requestRandomApod } from './services/requestApod';
import {
  ApodUiState,
  createErrorApodState,
  createIdleApodState,
  createLoadingApodState,
  createSuccessApodState
} from './types/apod';

const renderResult = (apodState: ApodUiState): ReactElement | null => {
  if (apodState.status === 'idle') {
    return null;
  }

  if (apodState.status === 'loading') {
    return <p className="apod-status">Loading image...</p>;
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
      <img className="apod-image" src={apodState.data.imageUrl} alt={apodState.data.title} />
      <p className="apod-explanation">{apodState.data.explanation}</p>
      {apodState.data.copyright !== undefined && (
        <p className="apod-copyright">{apodState.data.copyright}</p>
      )}
    </article>
  );
};

export function App() {
  const [apodState, setApodState] = useState<ApodUiState>(createIdleApodState());

  const loadDailyApod = async (): Promise<void> => {
    setApodState(createLoadingApodState());

    const response = await requestDailyApod();

    if (response.type === 'success') {
      setApodState(createSuccessApodState(response.data));
      return;
    }

    setApodState(createErrorApodState(response.error));
  };

  const loadRandomApod = async (): Promise<void> => {
    setApodState(createLoadingApodState());

    const response = await requestRandomApod();

    if (response.type === 'success') {
      setApodState(createSuccessApodState(response.data));
      return;
    }

    setApodState(createErrorApodState(response.error));
  };

  const isLoading = apodState.status === 'loading';

  return (
    <main className="page">
      <section className="viewer" aria-label="NASA APOD Viewer">
        <h1 className="viewer-title">NASA APOD Explorer</h1>
        <p className="viewer-subtitle">Choose one option to load an image.</p>
        <div className="viewer-actions">
          <button type="button" onClick={loadDailyApod} disabled={isLoading}>
            Picture of the Day
          </button>
          <button type="button" onClick={loadRandomApod} disabled={isLoading}>
            Random Picture
          </button>
        </div>
        <section className="viewer-result" aria-live="polite" aria-label="APOD result">
          {renderResult(apodState)}
        </section>
      </section>
    </main>
  );
}
