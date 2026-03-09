# Technical Specification Template

## Executive Summary

This implementation expands the current APOD contract and rendering pipeline from image-only to a unified media model that supports both images and directly playable videos in native HTML `<video>`. The backend remains the NASA integration boundary and now normalizes APOD responses into one success payload shape with media-aware fields. The frontend keeps the existing daily/random flows, but branches rendering by `mediaType` and supports muted autoplay-first playback behavior for video.

The solution prioritizes incremental evolution over rewrite: keep existing endpoints (`/api/apod/daily`, `/api/apod/random`), replace image-only mappers with media-aware validators, add a new domain error code (`MEDIA_TYPE_UNSUPPORTED`) for unsupported APOD media outcomes, and extend tests across backend, frontend, and Playwright e2e to cover media and failure edge cases.

## System Architecture

### Component Overview

- `backend/src/types/apod.ts` (modified): replace image-only success model with unified media success model and extend error codes.
- `backend/src/services/mapApodImageResponse.ts` (modified or renamed to `mapApodMediaResponse.ts`): validate APOD payloads and map image/video to unified result.
- `backend/src/services/fetchApodFromNasa.ts` (modified): keep daily/random requests; add APOD `thumbs=true` query support for potential video thumbnail mapping.
- `backend/src/services/classifyNasaFailure.ts` (modified): keep upstream mapping and include backend domain-level unsupported-media classification path.
- `backend/src/routes/getDailyApod.ts` (modified): return unified success payload; map unsupported media to `MEDIA_TYPE_UNSUPPORTED`.
- `backend/src/routes/getRandomApod.ts` (modified): same as daily route with random payload behavior.
- `frontend/src/types/apod.ts` (modified): new unified success type and new `MEDIA_TYPE_UNSUPPORTED` error code/message.
- `frontend/src/services/requestApod.ts` (modified): parse unified success payload and new error code.
- `frontend/src/App.tsx` (modified): render `<img>` for image and `<video>` for video; implement muted autoplay-first behavior; fallback error UX.
- `frontend/src/styles.css` (modified): add styles for video container and media error state with keyboard-visible focus.
- `backend/src/*.test.ts`, `frontend/src/*.test.tsx`, `e2e/apod-viewer.spec.ts`, `e2e/helpers/apodRouteMocks.ts` (modified): full-cycle test updates.

Data flow overview:
1. User triggers daily/random action.
2. Frontend requests backend APOD endpoint.
3. Backend requests NASA APOD and normalizes to unified payload.
4. If media is image: frontend renders image card.
5. If media is video and directly playable: frontend renders native `<video>` with muted autoplay-first.
6. If media is unsupported by product constraints: backend returns `MEDIA_TYPE_UNSUPPORTED`.
7. If runtime playback fails in browser: frontend shows native player failure when present or generic fallback in media area.

## Implementation Design

### Core Interfaces

```typescript
export type ApodMediaType = 'image' | 'video';

export interface ApodMediaResult {
  title: string;
  date: string;
  explanation: string;
  mediaType: ApodMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  copyright?: string;
}

export type ApodErrorCode =
  | 'RATE_LIMIT_REACHED'
  | 'TRY_AGAIN'
  | 'MEDIA_TYPE_UNSUPPORTED';
```

### Data Models

Backend NASA payload model (input):
- `title: string`
- `date: string`
- `explanation: string`
- `media_type: string`
- `url?: string`
- `thumbnail_url?: string`
- `copyright?: string`

Backend success response model (output):
- `title: string`
- `date: string`
- `explanation: string`
- `mediaType: 'image' | 'video'`
- `mediaUrl: string`
- `thumbnailUrl?: string`
- `copyright?: string`

Backend error response model (output):
- `errorCode: 'RATE_LIMIT_REACHED' | 'TRY_AGAIN' | 'MEDIA_TYPE_UNSUPPORTED'`
- `message: string`

Frontend UI state additions:
- Keep existing `idle|loading|success|error` state machine.
- `success` now carries `ApodMediaResult`.
- `error` supports new code `MEDIA_TYPE_UNSUPPORTED`.
- Optional local playback error state for video runtime failures (separate from API-request failure state) to show generic fallback if no native signal is available.

Validation and mapping rules:
- Accept APOD `media_type=image` and map to `mediaType='image'`.
- Accept APOD `media_type=video` only when URL is directly playable in `<video>`.
- Direct-playability check: parse URL and accept only known file extensions from path (`.mp4`, `.webm`, `.ogg`, `.ogv`, `.m4v`).
- If APOD `media_type` is not `image|video`, or video URL is not directly playable, throw domain error mapped to `MEDIA_TYPE_UNSUPPORTED`.
- Keep API key and upstream failure behavior unchanged.

### API Endpoints

- `GET /api/apod/daily`
- Description: fetch current APOD and return unified media payload.
- Request: none.
- Success response: `ApodMediaResult`.
- Error response: `{ errorCode, message }`.

- `GET /api/apod/random`
- Description: fetch one random APOD entry (`count=1`) and return unified media payload.
- Request: none.
- Success response: `ApodMediaResult`.
- Error response: `{ errorCode, message }`.

Status behavior:
- Keep existing success `200`.
- Keep existing backend error status behavior for compatibility (currently `502`) while relying on `errorCode` for client logic.

## Integration Points

- NASA APOD API endpoint remains `https://api.nasa.gov/planetary/apod`.
- Query behavior:
  - Daily: `api_key` (+ optional `thumbs=true`).
  - Random: `api_key` + `count=1` (+ optional `thumbs=true`).
- Authentication and quota remain NASA-key based.
- Upstream rate limits are mapped to `RATE_LIMIT_REACHED`.

External rule references informing implementation:
- NASA APOD service docs show `media_type` may be `image` or `video`, `url` carries media URL, `count` returns array, and `thumbs` can return `thumbnail_url` for videos.
- NASA API authentication guidance defines API-key limits and temporary blocking semantics.
- MDN video/autoplay guidance supports muted autoplay-first behavior and confirms autoplay with audible media is often blocked.

## Testing Approach

### Unit Testing

Backend unit tests:
- Mapper tests for image payload to unified result (`mediaType=image`, `mediaUrl=url`).
- Mapper tests for directly playable video payload (`mediaType=video`, `mediaUrl=url`, optional `thumbnailUrl`).
- Mapper rejects unsupported `media_type` with `MEDIA_TYPE_UNSUPPORTED` mapping path.
- Mapper rejects video URLs that are not directly playable by extension check.
- Failure classifier keeps 429 => `RATE_LIMIT_REACHED`, non-429 => `TRY_AGAIN`, domain unsupported => `MEDIA_TYPE_UNSUPPORTED`.
- Fetch service keeps daily without `count`, random with `count=1`, and includes `thumbs=true` when configured.

Frontend unit tests:
- Success mapping parses unified payload for both image and video.
- Error mapping supports `MEDIA_TYPE_UNSUPPORTED` message.
- App render path:
  - image response renders `<img>` and metadata.
  - video response renders `<video>` with `autoPlay`, `muted`, `playsInline`, `controls`.
- Video runtime error event triggers generic fallback message in player area when applicable.
- Keyboard focusability checks for media controls where test runtime permits (`tabIndex`/focus flow assertions on control surface).

### Integration Testing

Backend integration tests (`supertest`):
- `GET /api/apod/daily` returns unified image payload.
- `GET /api/apod/daily` returns unified video payload when URL is directly playable.
- `GET /api/apod/random` returns unified payload from first array item.
- NASA `429` returns `RATE_LIMIT_REACHED`.
- Unsupported media or non-direct-playable video returns `MEDIA_TYPE_UNSUPPORTED`.
- Generic upstream/internal failures return `TRY_AGAIN`.
- Not-found and existing error middleware behavior remain unchanged.

Test data requirements:
- Add fixtures for:
  - image payload,
  - direct-playable video payload,
  - non-direct video URL (e.g., non-file-hosted URL),
  - unsupported media_type payload,
  - rate-limit and generic failures.

### E2E Testing

Playwright (`./e2e/`) updates:
- Initial state remains unchanged (two actions, no media rendered).
- Daily image success renders image.
- Daily/random video success renders `<video>` and metadata.
- Verify video element attributes for autoplay attempt (`autoplay`, `muted`, `playsinline`, `controls`).
- Backend `MEDIA_TYPE_UNSUPPORTED` shows friendly unsupported message.
- Backend rate-limit and generic errors still show expected messages.
- Frontend playback failure scenario: route a broken video URL and assert fallback behavior in media area.

## Development Sequencing

### Build Order

1. Update shared contracts (backend + frontend type definitions) to unified media payload and new error code first, because all other modules depend on these interfaces.
2. Implement backend media mapper and unsupported-media classification path.
3. Update backend routes to use new mapper/error code mapping while preserving endpoint shape.
4. Update backend unit/integration tests to lock API behavior.
5. Update frontend request parser and UI rendering branch for image/video.
6. Implement muted autoplay-first and video runtime fallback behavior in UI.
7. Update frontend unit tests.
8. Update Playwright route mocks and e2e coverage for video and unsupported-media flows.
9. Run backend tests, frontend tests, and e2e suite; fix regressions.

### Technical Dependencies

- Existing dependencies are sufficient; no new media-player library is required.
- Runtime dependency on NASA APOD availability and key quota remains.
- Browser-level autoplay policy variability must be tolerated by design.
- Node runtime and existing test runners (`jest`, `vitest`, `playwright`) remain unchanged.

## Monitoring and Observability

- `info` logs:
  - APOD endpoint hit (`daily|random`).
  - mapped media type returned (`image|video`).
- `warn` logs:
  - `RATE_LIMIT_REACHED` events.
  - `MEDIA_TYPE_UNSUPPORTED` events with sanitized media metadata (no sensitive data).
- `error` logs:
  - upstream request/network failures,
  - malformed APOD payload validation failures.

## Technical Considerations

### Key Decisions

- Use one unified success payload (`mediaType` + `mediaUrl`) to avoid image/video-specific contracts.
- Keep existing API endpoints to minimize integration churn and preserve user flows.
- Support only direct video files playable by native `<video>`; do not implement iframe/provider players.
- Attempt muted autoplay first (`autoPlay + muted + playsInline`) to maximize cross-browser success.
- Introduce explicit `MEDIA_TYPE_UNSUPPORTED` for product-defined unsupported media outcomes.
- Prefer existing platform/browser APIs over new libraries.

Trade-offs:
- Extension-based direct-playability validation is deterministic and cheap, but may reject playable URLs without recognizable file extension.
- Native controls are browser-dependent; exact control surface may vary, but this avoids custom player complexity and aligns with requirement to use browser-provided player.

Rejected alternatives:
- Third-party player libraries (e.g., provider abstractions): rejected because scope is native `<video>` only and dependency is unnecessary.
- Provider iframe support (YouTube/Vimeo): rejected by explicit scope decision.

### Known Risks

- APOD frequently returns video URLs not directly playable in `<video>`; user experience may often surface `MEDIA_TYPE_UNSUPPORTED`.
- Browser autoplay policies may still block playback even when muted-autoplay is attempted, depending on environment constraints.
- URL-extension-only checks can produce false negatives for extensionless direct streams.

Mitigations:
- Clear unsupported-media messaging and stable error contract.
- Keep manual playback controls available when autoplay is blocked.
- Document and test unsupported-media edge cases explicitly.

### Standards Compliance

- AGENTS.md compliance:
  - TypeScript-only code (`.ts`/`.tsx`), no `any`.
  - Verb-based function naming (e.g., `map`, `fetch`, `classify`, `request`, `render`).
  - Early returns in route/render logic to avoid deep nesting.
  - Clear separation of query vs mutation responsibilities.
  - Unit tests kept near source as `*.test.*`.
  - E2E tests under `./e2e/`.

- Skill applicability:
  - `skill-creator`: not applicable.
  - `skill-installer`: not applicable.

### Relevant and Dependent Files

- `/Users/sogabe/projects/delighted-nasa-apod-viewer/AGENTS.md`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/prompts/templates/tech-spec-template.md`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/prompts/tasks/0002-add-support-to-apod-videos/prd.md`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/types/apod.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/services/fetchApodFromNasa.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/services/mapApodImageResponse.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/services/classifyNasaFailure.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/routes/getDailyApod.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/routes/getRandomApod.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/app.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/app.test.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/services/fetchApodFromNasa.test.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/services/mapApodImageResponse.test.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/services/classifyNasaFailure.test.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/types/apod.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/services/requestApod.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/App.tsx`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/styles.css`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/App.test.tsx`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/services/requestApod.test.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/e2e/apod-viewer.spec.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/e2e/helpers/apodRouteMocks.ts`
