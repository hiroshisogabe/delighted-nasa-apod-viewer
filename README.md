# Delighted NASA's APOD viewer
This application was built using the scaffolding frontend (React) and backend (Node/Express) from my own [repository](https://github.com/hiroshisogabe/scaffolding-fullstack-monorepo) and the guidelines provided by the creation of agents in the repository [_iadevt5_4_](https://github.com/rodrigobranas/iadevt5_4/tree/main/templates) (Thanks to [@rodrigobranas](https://github.com/rodrigobranas)).


You will be able to see the APOD or from a random date.

> Requires a `NASA_API_KEY` which is provided by NASA for free, check for more details [here](https://api.nasa.gov/).

## AI Documentation

### Tools

I used Codex CLI with gpt-5.3-codex high since the beginning until the end of the second issue, i.e. it took care of the creation of PRD, Tech Spec, generation and execution of tasks, QA and Code review.

### First issue

The first issue is related to the first implementation, i.e. based on the existing `backend` and `frontend`, the application should fetch data from APOD API and render the media, so far only `image`.

#### PRD (Product requirements document) generation

Reference the command, i.e. [`create-prd.md`](./prompts/commands/create-prd.md), together with the issue description, e.g. render-nasa-images.md, and let the agent work. The outcome should be the first output file: the PRD. In the middle, you might be asked to "clarify" some points like:

```plaintext
1. Feature scope name: what kebab-case feature name should I use for ./prompts/tasks/prd-[feature-name]/?
2. User entry point: should the initial UI show only two CTA buttons (Picture of the Day, Random Picture) with no image/details until one is clicked?
3. Random behavior: should “random picture” call APOD with count=1, or pick a random date and call APOD by date?
4. Media handling: should we support only media_type=image, or also define behavior for APOD videos (e.g., show message/link)?
5. Details shown: confirm required fields in UI (title, date, explanation, url, hdurl, copyright if present).
6. Error UX: what should users see for backend/APOD failures or rate limits?
7. Non-scope confirmation: should auth, favorites, pagination/history, and caching be explicitly out of scope?
8. Accessibility baseline: any specific requirement beyond standard keyboard access, labels, and alt text?
9. Success criteria: what measurable acceptance target should we use (e.g., user can load both modes in <=2 clicks, 95% successful responses)?
10. Constraints: any API usage limits, deployment constraints, or browser support targets to include?
```

And these were my answers:

```plaintext
1. 0001-render-nasa-images
2. exactly
3. call with count=1
4. only media_type=image
5. we don't need urr details, only title, date, explanation and copyright if present
6. users should see a message like "the rate limit was reached" in case it was or a "try again" 
7. yes, we don't need any of the things listed, so they're completely out of scope
8. no, these a11y are enough for now
9. user can load both modes and in case of any issue, a friendly feedback is provided, successful responses depends on the API availability
10. no constraints so far
```

The summary provided after the creation of the file was:

```plaintext
Very brief summary: the PRD defines on-demand APOD viewing with exactly two modes (day/random via count=1), backend-only NASA integration, image-only support,
required displayed fields (title, date, explanation, optional copyright), friendly error messaging (The rate limit was reached / Try again), and explicit out-of-
scope exclusions.
```

Some unexpected lines in the `prd.md` generated:
```plaintext
Operational metrics:
- Count of successful `Picture of the Day` requests.
- Count of successful `Random Picture` requests.
- Count of failed requests by error type (rate limit vs other errors).
```

This is also one of the reason for creating the PRD: details of things we did not foresee with a "basic" prompt. At this moment, we are not planning to implement operational metrics, therefore this "Objetive" would be out of the scope however we didn't even thought about it beforehand. I just deleted from the PRD.

#### Tech Spec generation

At this time, given we already have the PRD created, we don't reference the initial prompt. The PRD will be the input together with the command [`create-tech-spec.md`](./prompts/commands/create-tech-spec.md)to create the Tech Spec which also should use the template.

About the end-to-end test files locarion, as it wasn't specified anywhere, the agent assumed it  would be in the `.frontend` folder, however after adding a rule in `AGENTS.md` to place `e2e` test in the root `./e2e` folder, the rule was followed when generating the Tech Spec then.

We also didn't specify the logs, even though they were present in the [`tech-spec-template.md`](./prompts/templates/tech-spec-template.md), therefore the outcome from the agent was just decide which details should be logged in which level as follows:
- `info` logs:
  - APOD route requested: `daily` or `random`.
- `warn` logs:
  - NASA-originated 429 rate-limit events.
- `error` logs:
  - unexpected internal exceptions.

Some details of the clarification questions:

```plaintext
1. Should I define two endpoints (GET /api/apod/daily and GET /api/apod/random) instead of one mode-switched endpoint, to stay aligned with the “no flag parameters” rule in AGENTS.md?
2. For rate-limit detection, should The rate limit was reached be triggered only for NASA HTTP 429, or also for other upstream responses containing explicit rate-limit signals?
3. When APOD returns non-image media, should backend return the generic failure path (Try again) with a stable error code (for frontend mapping)?
4. Should the Tech Spec include Playwright E2E coverage as planned future tests, even though Playwright is not yet installed in this repository?
```

And these were my answers:

```plaintext
1. yes, two endpoints.
2. Yes, triggered only for NASA.
3. Yes.
4. Yes, add the installation of the dependency as a required step in the tech spec.
```

#### Task generation

As input we have the command [`create-tasks.md`](./prompts/commands/create-tasks.md) to generate the task and also the PRD and Tech Spec this time.

The [`task-template.md`](./prompts/templates/task-template.md), [`task-list-template.md`](./prompts/templates/task-list-template.md) and the command [`create-tasks.md`](./prompts/commands/create-tasks.md) itself are shorter than the previous commands, i.e. compared to the creation of the PRD and the Tech Spec. However we asked to approve the suggested tasks before their creation, so I got the following tasks break down for approval:

```plaintext
High-Level Task List (For Approval)

  1. 1.0 Build backend APOD core services

  - Deliverable: typed NASA APOD client (daily, random count=1), response mapper (image only), and failure classifier (RATE_LIMIT_REACHED vs TRY_AGAIN).
  - Tests: unit tests for payload mapping, non-image rejection, missing-field rejection, and failure classification.

  2. 2.0 Expose backend APOD endpoints

  - Deliverable: GET /api/apod/daily and GET /api/apod/random routes wired into app with normalized success/error contracts.
  - Tests: integration tests for success contracts, NASA 429 mapping, generic failure mapping, non-image mapping, and existing 404 behavior preservation.

  3. 3.0 Implement frontend APOD request layer and state model

  - Deliverable: typed frontend service to call backend endpoints and UI state modeling (idle, loading, success, error).
  - Tests: unit tests for service contract handling and error-code to message mapping.

  4. 4.0 Implement frontend APOD interaction UI

  - Deliverable: App.tsx renders empty initial state, exactly two actions (Picture of the Day, Random Picture), success metadata + image rendering, and friendly error
    messages.
  - Tests: component/unit tests for idle state, both success paths, and exact error messages (The rate limit was reached, Try again).

  5. 5.0 Add end-to-end APOD feature coverage

  - Deliverable: Playwright scenarios under ./e2e/ for full flows across frontend + backend.
  - Tests: E2E for initial empty state, daily success, random success, rate-limit message, and generic retry message.

  Approve this list and I will generate task-list.md plus detailed [number]_task.md files from templates.
```

And I approved. I could have merged the backend and frontend tasks into one, same as explored in the course "AI for Devs", but I decided to keep as the agent suggested.

#### Task execution

The main goal of the command [`execute-task.md`](./prompts/commands/execute-task.md) is to enforce all the boundaries and guideines when executing a task, in addition to the PRD, Tech Spec and the task it self.

Even though we have the `task-list.md` in place and we want to run each task at a time, let's add the command [`execute-task.md`](./prompts/commands/execute-task.md) together with the PRD, Tech Spec and the task, to avoid surprises.

As one task might depend at some point from others, for now the suggestion is to run them one by one in the pre-defined sequence.

When executing the last task, related to the creation of the end-to-end tests, it also adjusted the `.gitignore`. I simply forgot to mention or highlight this at any moment, which led me to understand that AI when better guided, can enhance the implementation and I could see it.

##### Some issue down the road?

The issue I found was the `NASA_API_KEY` hadn't been mentioned since the issue definition (the poor [prompt](./prompts/issues/0001-render-nasa-images.md)) and in the end, it wasn't even part of the `.env.example`. I had to tweak the LLM to adjust the `.env.example` and also set the key accordingly in a `.env`, otherwise the backend will never work as we expect.

All the test surprisingly ran and passed. I asked for an investigation and the result was:
- _In E2E tests, requests to the backend are intercepted and fulfilled with fixtures._

As the E2E tests doesn't actually requires the backend to work, depending on the point of view, they might not be effective and this guideline might be enforced somewhere, e.g. a rule in case it's applicable to all the project or in the task generation process by improving the command/prompt.

#### QA execution

For testing purposes, we'd like to see some bugs, however none were found after our QA agent had run. 

Its execution was achieved with the command [`execute-qa.md`](./prompts/commands/execute-qa.md) in the command folder.

#### Bugfix and Code Review

##### Bugfix

The main idea was to create a command/agent to fix the bugs, iterating over the `qa-report` for the related task and in addition cover the scenarios that failed with regression test to prevent these errors in the future.

The command/agent [`execute-bugfix.md`](./prompts/commands/execute-bugfix.md) is created however we didn't run it because as mentioned before, we had no bugs to be fixed.

We could have forced the generation of a bug, e.g. based on some discrepancy in the UI like keeping the input fixed at the top of the screen to prevent a layout shift when the content is loaded.

##### Code review

The command [`execute-review.md`](./prompts/commands/execute-review.md) specifies the `git diff` as a main tool to make sure which the differences are in the `main` from changes introduced in the new implementation.

The thing is I have split the whole process in many commits and Pull Requests, which would make sense for me. I am always thinking about a human reviewing my code, therefore a well structured and meaningful commits and PRs is my goal at the moment.

That said, the `main` branch has already many changes merged related to the task, e.g. the completion of the tasks. Therefore the code review agent at this moment will not be effective as it would in case we had everything that was introduced not in the `main`.

As we can see later in the [agent reviewer section](#task-execution-and-agent-reviewer), the code review agent can also be a subagent, running right after the tasks are completed, i.e. before the QA agent run.

### Second issue

The second issue request the support for video as media type. Unlike the issue one, we went through the whole process again, i.e. create the PRD, Tech Spec and generate the tasks.

#### Task execution and agent reviewer

In the [`execute-task.md`](./prompts/commands/execute-task.md) command, I added a new instruction, right after the implementation which was to call the agent [`reviewer`](./.codex/agents/reviewer.toml) as a subagent. I had to enable `multi-agents` in the Codex config, as I was using Codex at that moment, and decided to mention it explicitly in the command.

The main idea of having subagents is to keep the main context window that implemented the task not cluttered and safe from being compacted, i.e. the agent `reviewer` started a fresh new context window and at the end returned the result to the main context window which was waiting for the response.

We know the agent was spawned because of the mentioning in the terminal, e.g. when running the task 1 the fun thing is that Codex called the `reviewer` agent as `Darwin`, it took some time but the main agent held tight:
```paintext
• Spawned Darwin [reviewer]
  └ Review the current working tree changes for task 1.0 (backend unified APOD media support). Focus on correctness, regressions, missing tests, and alignment wi...

• Explored
  └ Read task-list.md

• Waiting for Darwin [reviewer]

• Finished waiting
  └ No agents completed yet
• I’m waiting on the reviewer agent result now; once it returns, I’ll apply any fixes immediately and finalize the task list update.

• Waiting for Darwin [reviewer]

• Finished waiting
  └ Darwin [reviewer]: Completed - Task `1.0` is implemented and marked complete. **Task Summary** - `Task ID`: `1.0` - `Task Name`: Build backend unified APOD media
support for daily and random flows - `Main Objective`: support APOD `image|video` with unified payload and...

• The reviewer agent returned without blocking findings. I’m now verifying final workspace state, running a backend build, and then I’ll update task-list.md in this
  branch before finalizing.
```

In the second task, the name of the agent was `Pauli`, and it approved with reservations, so the main agent did changes according to the reported issues:
```paintext
• Spawned Pauli [reviewer]
  └ Review the current workspace changes for task 2.0 (frontend APOD media image/video support). Focus on correctness, regressions, adherence to requirements in ...

• Waiting for Pauli [reviewer]

• Finished waiting
  └ Pauli [reviewer]: Completed - ## Findings (ordered by severity) ### Low 1. **End-to-end coverage gap for new video-specific behavior remains** - The Playwright
suite still validates only image success flows and generic backend errors; it does not yet cover: - video r...

Reviewer agent

- Ran reviewer agent and got APPROVED WITH RESERVATIONS.
- Only non-blocking note: video-specific e2e scenarios are still a coverage gap (expected for pending Task 3.0).
```

The third task was implemented and the `reviewer` found issues which were immediately tackled by the main agent, by the way, the name this time was `Kierkegaard`:
```bash
• Spawned Kierkegaard [reviewer]
  └ Review the current uncommitted changes for Task 3.0 (E2E APOD media coverage). Focus on bugs, regressions, missing tests, and requirement mismatches. Validat...

• Waiting for Kierkegaard [reviewer]

• Finished waiting
  └ No agents completed yet

• Waiting for Kierkegaard [reviewer]

• Finished waiting
  └ Kierkegaard [reviewer]: Completed - 1. **Medium – Requirement mismatch: random video scenario lacks core media behavior assertions** - In [`e2e/apod-
viewer.spec.ts:94`](/Users/sogabe/projects/delighted-nasa-apod-viewer/e2e/apod-viewer.spec.ts:94), the test name says “with ...

• The reviewer found two gaps, so I’m applying both: adding full playback-attribute assertions to the random-video E2E test, and aligning the unsupported-media fixture
  message with the app’s friendly unsupported message. Then I’ll rerun tests and re-run reviewer validation.
```

## Generated code

### Did everything go as expected?

I did not review all the generated code line by line, however noticed some outputs were not as I expected because I assumed the LLM would do the way I thought even I answered in the clarification questions, however the question wasn't deep enough.

For example when creating the new contract after asking to add the video support, it asked me if I wanted to create a unified contract:
> _Contract shape: do you want a unified success payload for both media types, e.g. mediaType, mediaUrl, optional thumbnailUrl, while keeping existing fields (title, date, explanation, copyright)?_

I just answered yes because I did want unified success payload however I did not pay attention to the properties of the payload.

In the end it changed the response payload by removing fields which would not be acceptable for backward compatibility, even though we're just trying out things locally, it'd be great to discuss as a clarification point and how to tackle this issue. Maybe the solution applied would be the best but some options could have been brought.

### In general

#### Backend

It did a good job, following some patterns for backend given we're using Express and it kept the main `app.ts` file "clean" and added the available `routes` to a specific folder. Create all the types and interfaces making it strict with TypeScript.

#### Frontend

For the frontend given it's a small application, I'm not quite sure it should have componentized more, because everything is in the `App.tsx`, including the logic that decides whether the media is an image or a video, it seems a bit cluttered.

Thus the main question is where would we enhance our process to guide the LLM regarding this? A "React best practices" skill would be enough? Should we enforce in the rules, e.g. `AGENTS.md` even though it's only related to frontend (maybe not) and not the entire project? Do we need one more agent for refactoring?

There's no answer until we try it out, check the results and iterate again. It's part of the process, i.e. go deeper.

## Run Application

### Installing dependencies

- Backend tests: `cd backend && npm install`
- Frontend tests: `cd frontend && npm install`

### Everything running

- Backend: `cd backend && npm run dev`
  - Available at http://localhost:3000/

- Frontend tests: `cd frontend && npm run dev`
  - Available at http://localhost:5173/

## Run Tests

### Unit and integration

- Backend tests: `cd backend && npm test`
- Frontend tests: `cd frontend && npm test`

### End-to-End Tests

1. Install root dependencies: `npm install`
2. Install browser binaries once: `npx playwright install chromium`
3. Run E2E suite: `npm run e2e`
