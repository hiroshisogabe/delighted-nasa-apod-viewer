# Task 2.0: Implement frontend unified APOD media request and rendering experience

<critical>Read the prd.md and tech-spec.md files in this folder; if you do not read these files, your task will be invalidated</critical>

## Overview

Implement frontend support for the unified APOD media contract so users can view either images or videos through existing daily/random actions, including muted autoplay attempt, essential controls, keyboard operability, and clear playback fallback feedback.

<requirements>
- Update frontend APOD types and request parsing to consume unified backend fields (`mediaType`, `mediaUrl`, optional `thumbnailUrl`) and `MEDIA_TYPE_UNSUPPORTED`.
- Keep existing user flows and state model while branching rendering between image and native video experiences.
- For video rendering, use native `<video>` with essential controls and autoplay attempt using muted and inline playback attributes.
- Surface frontend runtime playback errors in media area using native player error feedback when present, otherwise generic fallback messaging.
- Ensure media controls are reachable and operable via keyboard with logical focus behavior.
</requirements>

## Subtasks

- [ ] 2.1 Update frontend APOD domain types and error message mapping for unified media and `MEDIA_TYPE_UNSUPPORTED`.
- [ ] 2.2 Update APOD request service parsing and API error handling to support both image and video payloads.
- [ ] 2.3 Update app rendering logic to branch by `mediaType` and render `<img>` or native `<video>` with required playback attributes.
- [ ] 2.4 Add media UI state and styling for playback fallback errors and keyboard-visible control focus.
- [ ] 2.5 Add and run frontend unit/integration tests for request parsing, image/video rendering, autoplay attributes, keyboard access expectations, and playback fallback behavior.

## Implementation Details

Reference `tech-spec.md` sections:
- System Architecture -> Component Overview
- Implementation Design -> Core Interfaces
- Implementation Design -> Data Models
- Testing Approach -> Unit Testing
- Development Sequencing -> Build Order (steps 5 to 7)
- Technical Considerations -> Key Decisions

## Success Criteria

- Frontend correctly renders image payloads without regressions to existing APOD behavior.
- Frontend correctly renders video payloads with native video element configured for muted autoplay attempt and essential controls.
- Frontend displays supported backend errors including `MEDIA_TYPE_UNSUPPORTED` and handles runtime playback failure with clear fallback UI.
- Keyboard users can navigate and operate available media controls in a predictable order.
- Frontend unit and integration tests pass and cover both media types and critical error paths.

## Task Tests

- [ ] Unit tests
- [ ] Integration tests

<critical>ALWAYS CREATE AND RUN TASK TESTS BEFORE CONSIDERING IT FINISHED</critical>

## Relevant Files
- `prompts/tasks/0002-add-support-to-apod-videos/prd.md`
- `prompts/tasks/0002-add-support-to-apod-videos/tech-spec.md`
- `frontend/src/types/apod.ts`
- `frontend/src/services/requestApod.ts`
- `frontend/src/services/requestApod.test.ts`
- `frontend/src/App.tsx`
- `frontend/src/App.test.tsx`
- `frontend/src/styles.css`
