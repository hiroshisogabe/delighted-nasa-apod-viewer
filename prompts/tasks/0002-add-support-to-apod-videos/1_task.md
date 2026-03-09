# Task 1.0: Build backend unified APOD media support for daily and random flows

<critical>Read the prd.md and tech-spec.md files in this folder; if you do not read these files, your task will be invalidated</critical>

## Overview

Implement backend support for APOD image and direct-playable video responses across both `/api/apod/daily` and `/api/apod/random`, including unified response mapping and friendly backend error classification with `MEDIA_TYPE_UNSUPPORTED`.

<requirements>
- Implement a unified backend APOD media contract that supports `mediaType=image|video`, `mediaUrl`, and optional `thumbnailUrl`.
- Update NASA fetch behavior to preserve daily/random flows while supporting APOD `thumbs=true` when required for video metadata.
- Map unsupported APOD media outcomes (unknown media type or non-direct-playable video URL) to backend domain error `MEDIA_TYPE_UNSUPPORTED`.
- Keep backend integration boundary responsibilities unchanged: API key usage and upstream APOD interaction stay in backend services.
- Ensure both daily and random route handlers return consistent success and error payloads using the unified media contract.
</requirements>

## Subtasks

- [ ] 1.1 Update backend APOD types to the unified media result and extended error code model.
- [ ] 1.2 Implement/replace response mapping service to normalize `image` and direct-playable `video` APOD payloads.
- [ ] 1.3 Update NASA fetch service/query handling for daily/random behavior and thumbnail support.
- [ ] 1.4 Update backend failure classification and route handlers for `MEDIA_TYPE_UNSUPPORTED`, while preserving existing 429 and generic failure handling.
- [ ] 1.5 Add and run backend unit tests for mapper, classifier, and fetch behavior plus integration tests for `/api/apod/daily` and `/api/apod/random`.

## Implementation Details

Reference `tech-spec.md` sections:
- System Architecture -> Component Overview
- Implementation Design -> Core Interfaces
- Implementation Design -> Data Models
- Implementation Design -> API Endpoints
- Integration Points
- Testing Approach -> Unit Testing
- Testing Approach -> Integration Testing
- Development Sequencing -> Build Order (steps 1 to 4)

## Success Criteria

- Both backend endpoints return the same unified media payload shape for valid APOD `image` and direct-playable `video` entries.
- Unsupported or unusable media outcomes are returned as friendly backend errors with `MEDIA_TYPE_UNSUPPORTED`.
- Existing backend error behavior for rate limit (`RATE_LIMIT_REACHED`) and generic failures (`TRY_AGAIN`) remains stable.
- Backend unit and integration tests validate success and failure behavior for both daily and random flows.

## Task Tests

- [ ] Unit tests
- [ ] Integration tests

<critical>ALWAYS CREATE AND RUN TASK TESTS BEFORE CONSIDERING IT FINISHED</critical>

## Relevant Files
- `prompts/tasks/0002-add-support-to-apod-videos/prd.md`
- `prompts/tasks/0002-add-support-to-apod-videos/tech-spec.md`
- `backend/src/types/apod.ts`
- `backend/src/services/fetchApodFromNasa.ts`
- `backend/src/services/mapApodMediaResponse.ts`
- `backend/src/services/mapApodImageResponse.ts`
- `backend/src/services/classifyNasaFailure.ts`
- `backend/src/routes/getDailyApod.ts`
- `backend/src/routes/getRandomApod.ts`
- `backend/src/app.ts`
- `backend/src/app.test.ts`
- `backend/src/services/*.test.ts`
