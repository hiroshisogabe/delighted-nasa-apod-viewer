  1. What are the success criteria for this feature (for example, “all APOD media_type=image|video entries render correctly without error state”)?
  2. Which video sources must be supported in scope now (for example, YouTube/Vimeo embeds only, direct MP4 URLs, both)?
  3. What should happen when a video cannot be embedded/played (fallback UI, external link, error copy)?
  4. Do you want any backend contract changes beyond exposing media_type and media URL fields (for example, normalized embedUrl, validation flags)?
  5. What is explicitly out of scope for this PRD (for example, autoplay, analytics, fullscreen controls, legacy browser quirks)?
  6. Are there specific accessibility or UX requirements you want mandated (keyboard controls, captions indication, focus behavior, etc.)?

1. Yes, regardless the media_type, either image or video, the backend accepts and frontend will render.
2. The way the APOD API provides the media, check the API response and follow it.
3. The main goal is to use the player provided and available at any browser: if the error is caught in the backend side, a friendly message should be returned to frontend, as an error, otherwise if the error happens in the frontend, the player might show the native error or a generic should be provided instead of the player.
4. Only change or add additional fields if either it's required for the frontend to implement, otherwise keep the contract as it is.
5. We should use autoplay when possible and keep the minimum controls as play, pause, volume, mute, progress bar. Remove any additional control like statistics and analytics in case they exist. Browser legacy quirks is out of the scope.
6. The a11y should consider the tab behaviour, which will allow user to navigate through the controls and captions will be considered only if APOD returns it.
