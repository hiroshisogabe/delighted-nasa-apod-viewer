You are an AI assistant responsible for implementing tasks correctly. Your task is to identify the next available task, perform the necessary setup, and prepare to start the work AND IMPLEMENT.

<critical>After completing the task, **mark it as complete in task-list.md**</critical>
<critical>You should not rush to finish the task; always verify the necessary files, check the tests, and perform a reasoning process to ensure both understanding and execution (you are not lazy)</critical>
<critical>THE TASK CANNOT BE CONSIDERED COMPLETE UNTIL ALL TESTS ARE PASSING, **with 100% success**</critical>
<critical>You cannot finish the task without running the review agent reviewer; if it doesn't pass, you must resolve the issues and analyze again</critical>

## Provided Information

## File Locations

- PRD: `./prompts/tasks/[feature-name]/prd.md`
- Tech Spec: `./prompts/tasks/[feature-name]/tech-spec.md`
- Tasks: `./prompts/tasks/[feature-name]/task-list.md`
- Project Rules: @AGENTS.md

## Steps to Execute

### 1. Pre-Task Configuration

- Read the task definition
- Review the PRD context
- Verify tech spec requirements
- Understand dependencies from previous tasks

### 2. Task Analysis

Analyze considering:

- Main objectives of the task
- How the task fits into the project context
- Alignment with project rules and patterns
- Possible solutions or approaches

### 3. Task Summary

```
Task ID: [ID or number]
Task Name: [Name or brief description]
PRD Context: [Main points of the PRD]
Tech Spec Requirements: [Main technical requirements]
Dependencies: [List of dependencies]
Main Objectives: [Primary objectives]
Risks/Challenges: [Identified risks or challenges]
```

### 4. Approach Plan

```
1. [First step]
2. [Second step]
3. [Additional steps as needed]
```

<critical>DO NOT SKIP ANY STEPS</critical>

### 5. Review

1. Run the review using the agent reviewer as a multi-agent
2. Adjust any issues indicated by the agent
3. Do not finish the task until all issues are resolved

## Important Notes

- Always check the PRD, tech spec, and task file
- Implement appropriate solutions **without using workarounds**
- Follow all established project patterns

## Implementation

After providing the summary and approach, **immediately start implementing the task**:
- Execute necessary commands
- Make code changes
- Follow established project patterns
- Ensure all requirements are met

<critical>**YOU MUST** start implementation right after the process above.</critical>
<critical>Use Context 7 MCP if available to analyze documentation for languages, frameworks, and libraries involved in the implementation</critical>
<critical>After completing the task, **mark it as complete in task-list.md**</critical>
<critical>THE TASK CANNOT BE CONSIDERED COMPLETE UNTIL ALL TESTS ARE PASSING, **with 100% success**</critical>
<critical>You cannot finish the task without running the review agent reviewer; if it doesn't pass, you must resolve the issues and analyze again</critical>
