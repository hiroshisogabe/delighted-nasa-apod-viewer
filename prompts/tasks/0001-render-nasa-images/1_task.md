# Task 1.0: Build backend APOD core services

<critical>Read the prd.md and tech-spec.md files in this folder; if you do not read these files, your task will be invalidated</critical>

## Overview

Create typed backend services that call NASA APOD, validate image-only payloads, normalize success data, and classify failures into stable error codes for downstream routes.

<requirements>
- Implement backend APOD contracts in TypeScript without using any.
- Implement a NASA fetch service with separate daily and random behaviors (no flag parameter switching behavior).
- Implement response mapping that accepts only media_type=image and returns title, date, explanation, imageUrl, and optional copyright.
- Implement failure classification where only NASA 429 maps to RATE_LIMIT_REACHED and all other failures map to TRY_AGAIN.
- Keep command/query separation between fetch, mapping, and failure classification services.
</requirements>

## Subtasks

- [ ] 1.1 Add `backend/src/types/apod.ts` with upstream and normalized backend contracts.
- [ ] 1.2 Add `backend/src/services/fetchApodFromNasa.ts` with typed daily/random NASA requests.
- [ ] 1.3 Add `backend/src/services/mapApodImageResponse.ts` for image-only normalization.
- [ ] 1.4 Add `backend/src/services/classifyNasaFailure.ts` for stable error code mapping.
- [ ] 1.5 Add service-level tests for mapper, fetch-mode behavior contracts, and failure classification.

## Implementation Details

Reference `tech-spec.md` sections:
- System Architecture -> Component Overview
- Implementation Design -> Core Interfaces
- Implementation Design -> Data Models
- Integration Points
- Testing Approach -> Unit Testing
- Development Sequencing -> Build Order (steps 1 and 2)

## Success Criteria

- Daily and random NASA request construction is type-safe and deterministic.
- Non-image or malformed payloads are rejected as retryable failures.
- Error classification returns `RATE_LIMIT_REACHED` only for NASA-originated 429 responses.
- Service outputs match the backend success/error contracts required by downstream routes.

## Task Tests

- [ ] Unit tests
- [ ] Integration tests

<critical>ALWAYS CREATE AND RUN TASK TESTS BEFORE CONSIDERING IT FINISHED</critical>

## Relevant Files
- `prompts/tasks/0001-render-nasa-images/prd.md`
- `prompts/tasks/0001-render-nasa-images/tech-spec.md`
- `backend/src/types/apod.ts`
- `backend/src/services/fetchApodFromNasa.ts`
- `backend/src/services/mapApodImageResponse.ts`
- `backend/src/services/classifyNasaFailure.ts`
- `backend/src/services/*.test.ts`
