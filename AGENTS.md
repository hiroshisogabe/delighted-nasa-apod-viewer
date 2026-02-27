# AGENTS.md

## Scope
- These rules apply to both `./frontend` and `./backend`.

## Project Structure
- Create only folders and files required by the solution.
- Do not create empty placeholder directories.

## Language and File Types
- All source code must be written in English.
- Use TypeScript for application code.
- Prefer `.ts` and `.tsx`; avoid `.js` unless tooling requires it.
- Do not use `any`.

## Naming and Readability
- Use `camelCase` for methods, functions, and variables; `PascalCase` for classes and interfaces.
- Methods and functions must perform a clear action, and their names must start with a verb.
- Avoid using comments whenever possible; make the code self-explanatory.
- Declare constants for magic numbers to improve readability.
- Never declare more than one variable on the same line.

## Control Flow and Function Design
- Never nest more than two `if/else` blocks. Use early returns instead.
- Never use flag parameters to switch behavior. Extract them into specific functions.

## Function Responsibilities
- A method should either perform a mutation (command) or a query, but never both.
