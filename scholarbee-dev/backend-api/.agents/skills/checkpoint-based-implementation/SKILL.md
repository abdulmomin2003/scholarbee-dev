---
name: checkpoint-based-implementation
description: Implements tasks in incremental checkpoints with approval gates. Divides plans into checkpoints, generates conventional commit messages after each checkpoint, and waits for explicit approval before proceeding. Use when implementing features with step-by-step confirmation or when the user requests checkpoint-based workflow.
disable-model-invocation: true
---

# Checkpoint-Based Implementation

Implements tasks in incremental steps with mandatory approval gates between checkpoints.

## Workflow

### 1. Plan Creation

Before starting implementation:

1. Analyze the task requirements
2. Break down the work into logical checkpoints
3. Present the checkpoint plan to the user for approval
4. Wait for explicit approval before starting implementation

**Checkpoint Plan Format:**

```markdown
## Checkpoint Plan

- [ ] **Checkpoint 1**: [Description]
- [ ] **Checkpoint 2**: [Description]
- [ ] **Checkpoint 3**: [Description]
...

Reply with "approved" to start implementation, or request modifications to the plan.
```

### 2. Checkpoint Execution

For each checkpoint:

1. **Implement** the changes for the current checkpoint only
2. **Verify** the changes work as expected
3. **Generate** a conventional commit message (see format below)
4. **Stop** and present the checkpoint summary

**Checkpoint Summary Format:**

```markdown
## Checkpoint [N] Complete: [Title]

### Changes Made
- [List of changes]

### Files Modified
- `path/to/file1.ts`
- `path/to/file2.ts`

### Commit Message
```text
<type>(<scope>): <description>

[optional body]
[optional footer]
```

---

**Ready for next checkpoint?** Reply with:
- "approved" or "continue" to proceed to the next checkpoint
- "revise" with feedback to modify the current checkpoint
- "abort" to stop implementation


### 3. Revision Handling

If the user requests revisions:

1. **Do NOT proceed** to the next checkpoint
2. Implement the requested changes to the current checkpoint
3. Regenerate the commit message reflecting all changes
4. Present the updated checkpoint summary again
5. Wait for explicit approval

### 4. Completion

After all checkpoints are approved:

1. Confirm all checkpoints are complete
2. Offer to create a final summary (or a temporary .md file for pr description based on the checkpoints) or commit all changes

## Important Rules

1. **Never proceed without approval** - Always wait for explicit user confirmation
2. **One checkpoint at a time** - Only implement changes for the current checkpoint
3. **Revise, don't advance** - On revision requests, modify current checkpoint and regenerate commit message
4. **Clear commit messages** - Every checkpoint must have a conventional commit message
5. **Markdown code blocks** - Always present commit messages in markdown code blocks
5. **Stable Checkpoint** - Always check for errors, lint and format issues before proceeding to the next checkpoint. Each checkpoint should be stable and ready to run.
