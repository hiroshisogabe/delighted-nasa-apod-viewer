# Technical Specification Template

## Executive Summary

This feature implements on-demand NASA APOD rendering with a strict backend-proxy architecture. The frontend remains empty until the user explicitly requests either `Picture of the Day` or `Random Picture`, then calls backend endpoints dedicated to each mode. The backend integrates with NASA APOD, validates image-only media, normalizes response data, and returns a stable contract that supports deterministic frontend behavior.

Key decisions are: use two backend endpoints (no behavior flag), classify rate-limit feedback only from NASA-originated limits, and standardize non-image APOD responses as retryable failures. A transport field (`imageUrl`) is required for rendering and is intentionally treated as non-display metadata. This is a documented exception to the PRD response-field constraint and should be accepted explicitly.

## System Architecture

### Component Overview

- `backend/src/app.ts` (modified): wires APOD routes and keeps existing not-found and error middleware behavior.
- `backend/src/routes/getDailyApod.ts` (new): handles `GET /api/apod/daily` request lifecycle.
- `backend/src/routes/getRandomApod.ts` (new): handles `GET /api/apod/random` request lifecycle.
- `backend/src/services/fetchApodFromNasa.ts` (new): performs NASA API requests with typed mode-specific query parameters.
- `backend/src/services/mapApodImageResponse.ts` (new): validates upstream payload and maps to frontend-safe success model.
- `backend/src/services/classifyNasaFailure.ts` (new): maps upstream failures to stable backend error codes.
- `backend/src/types/apod.ts` (new): backend APOD contracts and upstream payload types.
- `frontend/src/services/requestApod.ts` (new): typed backend client for daily/random actions.
- `frontend/src/types/apod.ts` (new): frontend success/error contracts and UI state types.
- `frontend/src/App.tsx` (modified): implements idle/loading/success/error rendering with exactly two actions.
- `backend/src/app.test.ts` (modified): integration tests for endpoint contracts and failure mapping.
- `e2e/apod-viewer.spec.ts` (future new): Playwright end-to-end coverage after dependency setup.

Data flow overview:
1. User opens app and sees only two action buttons.
2. User clicks one action.
3. Frontend calls backend mode endpoint.
4. Backend calls NASA APOD (`/planetary/apod`) with API key and optional `count=1`.
5. Backend validates image media, maps success payload, or maps failure.
6. Frontend displays image with approved metadata or friendly error message.

## Implementation Design

### Core Interfaces

```typescript
interface ApodImageResult {
  title: string;
  date: string;
  explanation: string;
  imageUrl: string;
  copyright?: string;
}

type ApodErrorCode = 'RATE_LIMIT_REACHED' | 'TRY_AGAIN';

interface ApodService {
  fetchDailyImage(): Promise<ApodImageResult>;
  fetchRandomImage(): Promise<ApodImageResult>;
}
```

### Data Models

- Backend internal NASA payload model:
  - `title: string`
  - `date: string`
  - `explanation: string`
  - `media_type: 'image' | 'video' | string`
  - `url?: string`
  - `copyright?: string`

- Backend success response model:
  - `title: string`
  - `date: string`
  - `explanation: string`
  - `imageUrl: string`
  - `copyright?: string`

- Backend error response model:
  - `errorCode: 'RATE_LIMIT_REACHED' | 'TRY_AGAIN'`
  - `message: string`

- Frontend UI state model:
  - `idle`
  - `loading`
  - `success`
  - `error`

Contract notes:
- `imageUrl` is transport-only and must not be rendered as textual metadata.
- Visible metadata remains limited to `title`, `date`, `explanation`, and optional `copyright`.
- Non-image or malformed upstream payloads map to retryable failure.

### API Endpoints

- `GET /api/apod/daily`
- Description: fetches the APOD entry for the current day.
- Request: no body.
- Success response: `ApodImageResult`.
- Error response: `{ errorCode, message }`.

- `GET /api/apod/random`
- Description: fetches one random APOD entry using NASA `count=1`.
- Request: no body.
- Success response: `ApodImageResult`.
- Error response: `{ errorCode, message }`.

## Integration Points

- External API: NASA APOD `https://api.nasa.gov/planetary/apod`.
- Authentication: backend sends `api_key` from environment configuration.
- Random mode: backend sends `count=1` and handles array payload shape.
- Error handling approach:
  - Map to `RATE_LIMIT_REACHED` only when NASA-originated rate-limit condition is detected (HTTP 429 from NASA response).
  - Map all other failures to `TRY_AGAIN`.
  - Map non-image payloads to `TRY_AGAIN`.

## Testing Approach

### Unit Testing

- Backend unit tests:
  - validate payload mapping for daily object response.
  - validate payload mapping for random array response.
  - reject non-image payloads.
  - reject missing required fields.
  - map NASA 429 to `RATE_LIMIT_REACHED`.
  - map other failures to `TRY_AGAIN`.

- Frontend unit tests:
  - keep idle state empty at initial render.
  - load daily flow and render success fields.
  - load random flow and render success fields.
  - render exact user messages:
    - `The rate limit was reached`
    - `Try again`

### Integration Testing

- Backend integration tests using `supertest`:
  - `GET /api/apod/daily` returns normalized success contract.
  - `GET /api/apod/random` returns normalized success contract from NASA random array.
  - NASA 429 failure returns `RATE_LIMIT_REACHED` contract.
  - non-image and generic failures return `TRY_AGAIN` contract.
  - unknown routes continue to return existing 404 contract.

Test data strategy:
- Mock NASA HTTP responses with deterministic fixtures for each scenario.
- Keep fixture payloads limited to fields required by mapper behavior.

### E2E Testing

- Add Playwright in a future step and create `./e2e/` tests that run frontend + backend together.
- Required flows:
  - initial screen shows exactly two actions and no APOD content.
  - daily action renders image and approved metadata.
  - random action renders image and approved metadata.
  - NASA 429 path renders `The rate limit was reached`.
  - generic failure path renders `Try again`.

## Development Sequencing

### Build Order

1. Add backend APOD type models and NASA fetch service because all API behavior depends on contract stability.
2. Add backend mapper and failure classifier to isolate parsing and error translation logic.
3. Implement `GET /api/apod/daily` and `GET /api/apod/random` routes and wire them in `app.ts`.
4. Extend backend integration tests in `app.test.ts` to lock response/error contracts.
5. Implement frontend typed API client and state transitions in `App.tsx`.
6. Add frontend unit tests for render-state and message behavior.
7. Future step: install Playwright and add `./e2e/` coverage.

### Technical Dependencies

- `NASA_API_KEY` environment variable in backend runtime.
- Node runtime with global `fetch` support (Node 18+; project currently targets Node 22 types).
- External NASA APOD availability and quota.
- Future dependency for E2E: Playwright packages and config.

## Monitoring and Observability

- `info` logs:
  - APOD route requested (`daily` or `random`).
  - upstream status and backend response status.

- `warn` logs:
  - NASA-originated 429 rate-limit events.

- `error` logs:
  - upstream request failures.
  - payload validation failures.
  - unexpected internal exceptions.

Logging constraints:
- never log API key.
- include route and error code to support incident triage.

## Technical Considerations

### Key Decisions

- Use two endpoints to represent two explicit user intents and avoid behavior-flag parameters.
- Keep NASA integration only in backend to preserve API key secrecy and centralize error handling.
- Return normalized backend contracts to keep frontend logic simple and deterministic.
- Accept `imageUrl` as a transport-only field to make rendering possible while preserving display-field restrictions.
- Detect rate-limit user message only from NASA-originated limits (HTTP 429).
- Prefer built-in `fetch` instead of adding an HTTP client library.

### Known Risks

- PRD contract tension: strict response field list vs required image source for rendering.
- Mitigation: explicitly approve `imageUrl` transport field in tech spec and keep it hidden from displayed metadata.

- Upstream variability: NASA random response may include non-image entries.
- Mitigation: enforce image-only validation and map to `TRY_AGAIN`.

- Upstream instability: network failures or NASA downtime.
- Mitigation: stable error contract and clear user-facing feedback.

- E2E gap before Playwright installation.
- Mitigation: complete backend integration and frontend unit coverage first, then add Playwright as planned future step.

### Standards Compliance

- AGENTS.md compliance mapping:
  - TypeScript-only implementation (`.ts` and `.tsx`).
  - no `any` in contracts, services, routes, or tests.
  - function names use verbs (`fetch`, `map`, `classify`, `request`).
  - avoid deep nesting by using early returns in route/service logic.
  - command/query responsibilities separated across mapper, fetcher, and handlers.
  - unit tests remain near source using `*.test.*` naming.
  - E2E tests go under `./e2e/`.

- Skills applicability:
  - `skill-creator`: not applicable for this task.
  - `skill-installer`: not applicable unless a user asks to install a skill.

### Relevant and Dependent Files

- `/Users/sogabe/projects/delighted-nasa-apod-viewer/AGENTS.md`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/prompts/templates/tech-spec-template.md`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/prompts/tasks/0001-render-nasa-images/prd.md`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/prompts/tasks/0001-render-nasa-images/tech-spec.md`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/app.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/index.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/src/app.test.ts`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/backend/package.json`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/App.tsx`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/main.tsx`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/src/styles.css`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/frontend/package.json`
- `/Users/sogabe/projects/delighted-nasa-apod-viewer/e2e/` (future)
