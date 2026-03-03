# Task 4.0: Implement frontend APOD interaction UI

<critical>Read the prd.md and tech-spec.md files in this folder; if you do not read these files, your task will be invalidated</critical>

## Overview

Update the main frontend UI to provide exactly two APOD actions, keep the initial screen empty of APOD content, and render either success metadata/image or friendly error feedback.

<requirements>
- Initial render must show action controls but no APOD content.
- UI must expose exactly two actions: `Picture of the Day` and `Random Picture`.
- Success view must render image plus allowed metadata fields only.
- Error view must show exact messages: `The rate limit was reached` or `Try again`.
- Controls and rendered result areas must remain keyboard accessible and clearly labeled.
</requirements>

## Subtasks

- [x] 4.1 Update `frontend/src/App.tsx` to handle idle/loading/success/error rendering paths.
- [x] 4.2 Render the two required action buttons and connect them to request layer methods.
- [x] 4.3 Render success state with image and approved metadata fields.
- [x] 4.4 Render error state with exact user-facing messages mapped from backend error codes.
- [x] 4.5 Add component tests for initial, success, and failure paths across both actions.

## Implementation Details

Reference `tech-spec.md` sections:
- User Experience -> Main flow and UI/UX requirements (from PRD)
- System Architecture -> Component Overview (`frontend/src/App.tsx`)
- Testing Approach -> Frontend unit testing bullets
- Development Sequencing -> Build Order (steps 5 and 6)

## Success Criteria

- Initial screen has no APOD content before user action.
- Both action buttons trigger the expected daily/random flows.
- Success rendering includes image plus approved metadata only.
- Failure rendering shows the exact required messages for rate-limit and generic failures.

## Task Tests

- [x] Unit tests
- [x] Integration tests

<critical>ALWAYS CREATE AND RUN TASK TESTS BEFORE CONSIDERING IT FINISHED</critical>

## Relevant Files
- `prompts/tasks/0001-render-nasa-images/prd.md`
- `prompts/tasks/0001-render-nasa-images/tech-spec.md`
- `frontend/src/App.tsx`
- `frontend/src/App.test.tsx`
- `frontend/src/styles.css`
