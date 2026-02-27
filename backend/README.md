# Backend

## Scripts

- `npm run build`: compiles TypeScript using `tsc -p tsconfig.json`.
- `npm start`: runs the compiled app from `dist/index.js`.
- `npm run dev`: runs `ts-node-dev --respawn --transpile-only src/index.ts`.
- `npm test`: runs `jest --runInBand`.

### Detailed Script Options

#### `dev` script

Command:
`ts-node-dev --respawn --transpile-only src/index.ts`

- `--respawn`
  - Runs the app in a child process and restarts it on file changes or process exit.
  - Keeps the local development loop fast when editing backend code.
- `--transpile-only`
  - Transpiles TypeScript without full type-checking.
  - Improves startup and reload speed.
  - Type errors are still caught by `npm run build`.
- `src/index.ts`
  - Backend entrypoint in development.

#### `test` script

Command:
`jest --runInBand`

- `--runInBand`
  - Runs tests serially in a single process.
  - Avoids parallel worker overhead and concurrency-related flakiness.
  - Useful for smaller suites and constrained environments.
