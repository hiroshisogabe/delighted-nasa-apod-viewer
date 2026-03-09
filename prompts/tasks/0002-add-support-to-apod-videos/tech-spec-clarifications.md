  1. Contract shape: do you want a unified success payload for both media types, e.g. mediaType, mediaUrl, optional thumbnailUrl, while keeping existing fields (title,
     date, explanation, copyright)?
  2. Video source handling: should frontend support both direct video files (.mp4/.webm) and provider embeds (e.g. YouTube iframe URLs), or only whatever is directly
     playable in <video>?
  3. Autoplay policy: should implementation always attempt muted autoplay first (most browser-compatible), then let users unmute manually?
  4. Controls requirement: for provider iframes (YouTube), some controls are provider-managed. Is “minimum controls only” interpreted as “configure what is
     configurable, accept provider defaults otherwise”?
  5. Error contract: should backend keep existing error codes only (RATE_LIMIT_REACHED, TRY_AGAIN) and map all media-validation failures to TRY_AGAIN?
  6. Security constraint: do you want an explicit embed-host allowlist (for iframe URLs) in backend validation, or trust APOD URLs as-is?
  7. Test scope for this task: should the tech spec require updates to backend unit/integration tests, frontend unit tests, and Playwright e2e tests in ./e2e/ in the
     same implementation cycle?

1. Yes, I want a unified success payload.
2. Only whatever is directly playable in <video>.
3. Yes, implementation should always attempt muted autoplay first.
4. We will handle only directly playable in <video>, so we will not have provider iframes.
5. Yes, keep both (RATE_LIMIT_REACHED, TRY_AGAIN) in case there isn't any other media_type that we could play/render, otherwise create a MEDIA_TYPE_UNSUPPORTED error code.
6. Trust APOD URLs as-is.
7. Yes, the tech spec should consider the full cycle of implementation of the feature when all specified and current tests are updated accordingly to cover the new feature and any edge cases.
