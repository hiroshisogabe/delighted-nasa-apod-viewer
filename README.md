# Scaffolding `frontend` and `backend` monorepo in TypeScript

## Why?

### The history behind motivation

The term "vibe-coding" had never made any sense to me because I could not trust writing a prompt and letting code be written without (double) checking, essentially reviewing all the code generated in each step. 

Nevertheless, it seems this is the new reality: write prompts and let the AI code. Otherwise, people wouldn't be talking about multi-agents if it's hard for me to babysit one agent, how could I do it for multi-agents?

This is where my friend [fabricioviapiana](https://github.com/fabricioviapiana) introduces me to the "AI for Devs" course from [rodrigobranas](https://github.com/rodrigobranas). It was a hands-on course about creating good prompts and, beyond that, a workflow from Product Requirement Document (PRD) through the effective generation and execution of tasks. How to manage the context window that sometimes is compacted or even already too cluttered to perform nicely.

### Finally the curiosity as fuel to start

They started the course with a "base" monorepo with `frontend` and `backend`.

I wondered how they created this "base" and then I decided to follow the hand-crafted prompts taught in the course, which mix `tags` and `markdown`: one prompt to bootstrap the backend and another for the frontend.

## The usage of AI

### So was AI used to create the monorepo?

Yes, I started with the creation of the `backend` prompt and let the LLM generate the code. After each try I asked the LLM to fix the codebase due to something unexpected and also adjust the prompt to avoid the issue in the future.

When the result was satisfactory, i.e., the LLM could write the code as I expected, I created the `frontend` prompt based on the `backend` once it was sufficiently refined.

### Prompts

The initial prompts that I used to bootstrap the repo are under the [`./prompts`](./prompts/) folder.

### Only prompts at this moment?

I created an [`AGENTS.md`](./AGENTS.md) following the `rules` principles, i.e. meaningful instructions and definitions which are relevant for the entire codebase, leaving self-contained and specific instructions to `skills` at another time, for instance, to build some functionality using this scaffolding monorepo as the base project.

### Don't we have the stack defined to add related `skills` as well?

It's a valid point, however the next project that will use this repository as a boilerplate, could either install a skill provided from any source, e.g. the vercel-react-best-practices for the `frontend`, or create one from scratch with the agent's help.

## Tech details

The generated files for the "basic" `frontend` and `backend` can be found in the respective folders:
- [`./frontend`](./frontend/)
- [`./backend`](./backend/)

You can check both `package.json` to understand which `scripts` are available, for instance start both `frontend` and `backend` on local environment.