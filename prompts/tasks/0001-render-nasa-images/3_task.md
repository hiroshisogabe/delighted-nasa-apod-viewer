# Task 3.0: Implement frontend APOD request layer and state model

<critical>Read the prd.md and tech-spec.md files in this folder; if you do not read these files, your task will be invalidated</critical>

## Overview

Create typed frontend request functions and APOD UI state contracts to support explicit daily/random actions and deterministic success/error handling.

<requirements>
- Add frontend APOD types for success payloads, backend error codes, and UI state variants.
- Add request functions for daily and random backend endpoints without using behavior flags.
- Keep initial state as `idle` with no APOD content rendered.
- Map backend error codes to frontend-safe outcomes consumed by the UI layer.
- Keep application code in TypeScript and avoid any.
</requirements>

## Subtasks

- [ ] 3.1 Add `frontend/src/types/apod.ts` with typed result, error, and UI state models.
- [ ] 3.2 Add `frontend/src/services/requestApod.ts` with daily/random request methods.
- [ ] 3.3 Add tests validating request contract parsing and error mapping behavior.
- [ ] 3.4 Add tests validating state transition rules for idle/loading/success/error flows.

## Implementation Details

Reference `tech-spec.md` sections:
- System Architecture -> Component Overview
- Implementation Design -> Data Models
- Implementation Design -> Core Interfaces
- Testing Approach -> Frontend unit testing bullets
- Development Sequencing -> Build Order (step 5 as request/state foundation)

## Success Criteria

- Frontend request layer calls only backend APOD endpoints.
- Error outcomes are represented in a typed form that supports exact UI messages.
- UI state model supports deterministic transitions from idle to loading, success, and error.
- Contracts align with backend response model and do not introduce unsupported fields.

## Task Tests

- [ ] Unit tests
- [ ] Integration tests

<critical>ALWAYS CREATE AND RUN TASK TESTS BEFORE CONSIDERING IT FINISHED</critical>

## Relevant Files
- `prompts/tasks/0001-render-nasa-images/prd.md`
- `prompts/tasks/0001-render-nasa-images/tech-spec.md`
- `frontend/src/types/apod.ts`
- `frontend/src/services/requestApod.ts`
- `frontend/src/services/requestApod.test.ts`
- `frontend/src/types/apod.test.ts`
