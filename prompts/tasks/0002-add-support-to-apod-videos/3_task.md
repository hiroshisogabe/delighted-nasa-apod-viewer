# Task 3.0: Add end-to-end APOD media coverage for image, video, and error paths

<critical>Read the prd.md and tech-spec.md files in this folder; if you do not read these files, your task will be invalidated</critical>

## Overview

Add Playwright end-to-end coverage under `./e2e/` to validate complete APOD media behavior across daily and random actions, including image success, video success, backend-classified errors, and frontend playback fallback behavior.

<requirements>
- Keep E2E tests in `./e2e/` and use deterministic APOD route mocks for stable outcomes.
- Cover daily and random success flows for both supported media types where applicable.
- Validate backend error experiences for `MEDIA_TYPE_UNSUPPORTED`, `RATE_LIMIT_REACHED`, and `TRY_AGAIN`.
- Validate frontend runtime playback-failure fallback behavior when video source cannot be played.
- Ensure E2E assertions verify user-visible content and critical media element behavior.
</requirements>

## Subtasks

- [ ] 3.1 Update E2E route mock helpers to support image, direct-playable video, unsupported media, rate-limit, generic failure, and broken-video scenarios.
- [ ] 3.2 Extend `e2e/apod-viewer.spec.ts` with daily/random media success scenarios and core media assertions.
- [ ] 3.3 Add backend error scenario coverage for `MEDIA_TYPE_UNSUPPORTED`, `RATE_LIMIT_REACHED`, and `TRY_AGAIN`.
- [ ] 3.4 Add frontend playback failure scenario coverage asserting fallback message behavior in the media area.
- [ ] 3.5 Run E2E suite and stabilize tests to avoid flakiness.

## Implementation Details

Reference `tech-spec.md` sections:
- Testing Approach -> E2E Testing
- Development Sequencing -> Build Order (step 8 and step 9)
- Known Risks
- Mitigations

## Success Criteria

- E2E suite validates supported APOD media user journeys for both daily and random actions.
- E2E suite validates clear user-visible behavior for backend and frontend error classes.
- Test fixtures/mocks are deterministic and keep the suite reliable.
- E2E coverage confirms image and video functionality introduced by backend/frontend tasks.

## Task Tests

- [ ] Unit tests
- [ ] Integration tests

<critical>ALWAYS CREATE AND RUN TASK TESTS BEFORE CONSIDERING IT FINISHED</critical>

## Relevant Files
- `prompts/tasks/0002-add-support-to-apod-videos/prd.md`
- `prompts/tasks/0002-add-support-to-apod-videos/tech-spec.md`
- `e2e/apod-viewer.spec.ts`
- `e2e/helpers/apodRouteMocks.ts`
- `e2e/helpers/*.test.ts`
