# Task 5.0: Add end-to-end APOD feature coverage

<critical>Read the prd.md and tech-spec.md files in this folder; if you do not read these files, your task will be invalidated</critical>

## Overview

Add end-to-end coverage for the APOD user journeys in `./e2e/`, validating complete behavior from initial state to success and failure outcomes for both user actions.

<requirements>
- Place E2E tests under `./e2e/`.
- Cover initial state with no APOD content before user action.
- Cover both action flows (`Picture of the Day` and `Random Picture`) with successful rendering assertions.
- Cover both failure message flows (`The rate limit was reached` and `Try again`).
- Keep fixtures and helpers deterministic to avoid flaky tests.
</requirements>

## Subtasks

- [ ] 5.1 Install/configure Playwright for the repository if not already configured.
- [ ] 5.2 Add `e2e/apod-viewer.spec.ts` with daily and random success scenarios.
- [ ] 5.3 Add failure scenarios for rate-limit and generic error messaging.
- [ ] 5.4 Add lightweight test helper utilities and unit tests for helper behavior.
- [ ] 5.5 Integrate E2E run instructions into project scripts/documentation as needed.

## Implementation Details

Reference `tech-spec.md` sections:
- Testing Approach -> E2E Testing
- Development Sequencing -> Build Order (step 7)
- Technical Dependencies -> Future dependency for E2E: Playwright

## Success Criteria

- E2E suite validates all required APOD user-visible flows end-to-end.
- Tests are deterministic and pass reliably with controlled test data.
- E2E coverage aligns with PRD acceptance expectations for success and friendly failures.
- E2E assets are located in `./e2e/` and runnable by contributors.

## Task Tests

- [ ] Unit tests
- [ ] Integration tests

<critical>ALWAYS CREATE AND RUN TASK TESTS BEFORE CONSIDERING IT FINISHED</critical>

## Relevant Files
- `prompts/tasks/0001-render-nasa-images/prd.md`
- `prompts/tasks/0001-render-nasa-images/tech-spec.md`
- `e2e/apod-viewer.spec.ts`
- `e2e/helpers/*.ts`
- `e2e/helpers/*.test.ts`
- `package.json`
