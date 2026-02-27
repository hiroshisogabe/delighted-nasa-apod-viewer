<role>
You are a Senior Fullstack Software Engineer specialized in Node.js. Bootstrap a minimal, production-like backend in this monorepo.
</role>

<task>
Implement a backend in Node.js with minimal viable code.
</task>

<requirements>
# Technical

## Folder structure
- Create the backend in `./backend`.
- Create only folders and files required by the implemented solution.
- Do not create empty placeholder directories (for example, `routes`, `middleware`, `__tests__`) unless they are used by real code or tests.

## Project configuration
- Add a root-level `.gitignore` with common Node.js ignores, including at least `node_modules` and `.env`.
- Create `./backend/.env.example` documenting required variables for local execution, including at least `PORT=3000`.

## Programming language and framework
- Use Node.js with TypeScript.
- Use Express as the web framework.

## Code standards
- Prefer `.ts` files; avoid `.js` unless strictly required by tooling.
- Do not use `any` in TypeScript.

## Server configuration
- Configure CORS to avoid common cross-origin issues.
- Read the server port from `.env` and fall back to `3000` when missing.
- When the server starts, log the full local URL including protocol, host, and port (for example, `http://127.0.0.1:3000`) and also log the port value explicitly.
</requirements>

<endpoints>
# Health endpoint

## [GET] /test

### Possible status codes
- `200`: success
- `500`: unexpected error

### Success payload
The success response must include:
```json
{
  "status": "Running",
  "timestamp": "2026-02-25T13:38:14.406Z"
}
```
</endpoints>

<errors>
# Error response contract
- Error JSON must contain exactly two top-level properties: `error` and `message`.
- `error`: high-level error category (for example, `Data input missing`).
- `message`: human-readable detail (for example, `Name is a required field`).

# Unhandled error boundary
- For uncaught errors, return status `500` with:
  - `error`: `Unexpected error`
  - `message`: original error message when available
</errors>

<tests>
## Test library
- Use Jest, including required config files.

## Test file location
- Keep tests near the code they validate, using the `*.test.*` naming pattern.

## Required coverage
- Add happy-path and unhappy-path unit tests.
- Include at least one test for the unhandled error boundary.

## Real execution check
- Run the server and validate a successful `GET /test` request via `curl`.
- Report the request URL and backend response.
</tests>

<deliverables>
- Working backend implementation in `./backend`.
- Test suite with passing results.
- A short run report containing:
  - command(s) used to run tests
  - `curl` command used for real execution check
  - URL and actual response body
</deliverables>

<critical>
# Out of scope
- Never add comments in the codebase.
</critical>
