# Task 2.0: Expose backend APOD endpoints

<critical>Read the prd.md and tech-spec.md files in this folder; if you do not read these files, your task will be invalidated</critical>

## Overview

Implement and wire backend API routes for APOD daily and random flows using the core services, returning normalized success payloads and stable error contracts.

<requirements>
- Expose `GET /api/apod/daily` and `GET /api/apod/random` routes.
- Use backend services from Task 1.0; do not move NASA calls to frontend.
- Preserve existing app middleware behavior, including unknown route 404 handling.
- Return only approved success fields plus `imageUrl` transport field.
- Return `RATE_LIMIT_REACHED` and `TRY_AGAIN` error contracts consistently for both routes.
</requirements>

## Subtasks

- [ ] 2.1 Add `backend/src/routes/getDailyApod.ts` route handler.
- [ ] 2.2 Add `backend/src/routes/getRandomApod.ts` route handler using `count=1` behavior via service.
- [ ] 2.3 Wire both routes in `backend/src/app.ts` without breaking existing middleware flow.
- [ ] 2.4 Extend `backend/src/app.test.ts` for success and failure contract coverage.

## Implementation Details

Reference `tech-spec.md` sections:
- System Architecture -> Component Overview
- Implementation Design -> API Endpoints
- Integration Points
- Testing Approach -> Integration Testing
- Development Sequencing -> Build Order (steps 3 and 4)

## Success Criteria

- Both APOD endpoints respond with normalized contract on valid image payloads.
- NASA 429 failures are returned as `RATE_LIMIT_REACHED`.
- Non-image and generic failures are returned as `TRY_AGAIN`.
- Existing non-APOD route behavior remains unchanged.

## Task Tests

- [ ] Unit tests
- [ ] Integration tests

<critical>ALWAYS CREATE AND RUN TASK TESTS BEFORE CONSIDERING IT FINISHED</critical>

## Relevant Files
- `prompts/tasks/0001-render-nasa-images/prd.md`
- `prompts/tasks/0001-render-nasa-images/tech-spec.md`
- `backend/src/app.ts`
- `backend/src/routes/getDailyApod.ts`
- `backend/src/routes/getRandomApod.ts`
- `backend/src/app.test.ts`
