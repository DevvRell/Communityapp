# Agent Teams Reference Guide

> Source: https://code.claude.com/docs/en/agent-teams
> Requires: Claude Code v2.1.32+ | Feature flag: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

---

## What Are Agent Teams?

Agent teams coordinate multiple Claude Code instances working together. One session acts as the **team lead** — it creates the team, spawns teammates, assigns tasks, and synthesizes results. **Teammates** work independently in their own context windows and can communicate directly with each other.

This project has agent teams enabled via `.claude/settings.local.json`.

---

## Agent Teams vs. Subagents

| | Subagents | Agent Teams |
|---|---|---|
| **Context** | Own context; results return to caller | Own context; fully independent |
| **Communication** | Report back to main agent only | Teammates message each other directly |
| **Coordination** | Main agent manages all work | Shared task list with self-coordination |
| **Best for** | Focused tasks where only the result matters | Complex work requiring discussion & collaboration |
| **Token cost** | Lower — results summarized back | Higher — each teammate is a separate Claude instance |

**Rule of thumb:** Use subagents for quick, focused workers. Use agent teams when teammates need to share findings, challenge each other, and coordinate on their own.

---

## When to Use Agent Teams

### Strong use cases
- **Research & review** — Multiple teammates investigate different aspects simultaneously, then share and challenge findings
- **New modules or features** — Each teammate owns a separate piece without stepping on others
- **Debugging with competing hypotheses** — Teammates test different theories in parallel and converge faster
- **Cross-layer coordination** — Changes spanning frontend, backend, and tests, each owned by a different teammate

### Avoid agent teams for
- Sequential tasks
- Same-file edits
- Work with many inter-dependencies
- Routine, single-concern tasks (a single session or subagents are more cost-effective)

---

## Architecture

| Component | Role |
|---|---|
| **Team lead** | Main Claude Code session — creates team, spawns teammates, coordinates work |
| **Teammates** | Separate Claude Code instances working on assigned tasks |
| **Task list** | Shared work items teammates claim and complete |
| **Mailbox** | Messaging system for inter-agent communication |

**Storage locations:**
- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`

---

## Configuration

### Enable agent teams (project-level — already configured)
```json
// .claude/settings.local.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Display mode
```json
// settings.json — options: "auto" (default), "in-process", "tmux"
{
  "teammateMode": "in-process"
}
```
Or as a flag: `claude --teammate-mode in-process`

**Display modes:**
- `in-process` — All teammates run inside main terminal. Use `Shift+Down` to cycle through teammates. Works in any terminal.
- `tmux` / split panes — Each teammate gets its own pane. Requires tmux or iTerm2 with `it2` CLI.
- `auto` — Uses split panes if already in tmux, otherwise in-process.

---

## Starting a Team

Simply describe the task and team structure in natural language:

```text
Create an agent team with 3 teammates:
- One focused on [role A]
- One focused on [role B]
- One playing devil's advocate
Use Sonnet for each teammate.
```

Claude creates the team, spawns teammates, assigns work via the shared task list, and cleans up when done.

---

## Controlling the Team

### Talk to the lead
Give the lead instructions in natural language — it handles coordination, task assignment, and delegation.

### Talk to teammates directly
- **In-process mode:** `Shift+Down` to cycle to a teammate → type to message them
- `Enter` to view a teammate's session | `Escape` to interrupt their turn
- `Ctrl+T` to toggle the task list
- **Split-pane mode:** Click into a teammate's pane

### Assign tasks
- **Lead assigns:** Tell the lead which task to give which teammate
- **Self-claim:** Teammates automatically pick up the next unassigned, unblocked task when they finish

### Require plan approval
```text
Spawn an architect teammate to refactor the auth module.
Require plan approval before they make any changes.
```
Teammates work in read-only plan mode until the lead approves. The lead can reject with feedback and the teammate revises.

### Shut down a teammate
```text
Ask the researcher teammate to shut down
```

### Clean up the team
```text
Clean up the team
```
Always clean up through the **lead**. Shut down all teammates first.

---

## Best Practices

### Team size
- **Start with 3–5 teammates** for most workflows
- **5–6 tasks per teammate** keeps everyone productive without excessive context switching
- Token costs scale linearly — each teammate has its own context window
- Three focused teammates often outperform five scattered ones

### Task sizing
| Size | Problem |
|---|---|
| Too small | Coordination overhead exceeds benefit |
| Too large | Teammates work too long without check-ins — risk of wasted effort |
| Just right | Self-contained unit with a clear deliverable (a function, a test file, a review) |

### Context
Teammates load CLAUDE.md, MCP servers, and skills automatically — but **do not inherit the lead's conversation history**. Always include task-specific context in the spawn prompt:

```text
Spawn a security reviewer with the prompt: "Review src/auth/ for vulnerabilities.
Focus on token handling, session management, and input validation.
The app uses JWT tokens in httpOnly cookies. Report issues with severity ratings."
```

### Parallel work tips
- **Avoid file conflicts** — break work so each teammate owns different files
- **Monitor and steer** — don't let the team run unattended too long
- **Start with research/review** if new to agent teams — clear boundaries, no parallel write conflicts
- If the lead starts implementing instead of waiting: `"Wait for your teammates to complete their tasks before proceeding"`

### Hooks for quality gates
- `TeammateIdle` — runs when a teammate goes idle; exit code 2 sends feedback and keeps them working
- `TaskCompleted` — runs when a task is marked complete; exit code 2 prevents completion and sends feedback

---

## Effective Prompting Patterns

### Parallel code review
```text
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

### Competing hypothesis debugging
```text
Users report [bug]. Spawn 5 agent teammates to investigate different hypotheses.
Have them talk to each other to try to disprove each other's theories,
like a scientific debate. Update the findings doc with whatever consensus emerges.
```

### Cross-layer feature work
```text
Create a team with 4 teammates to build [feature] in parallel.
Teammate 1: API routes and controllers
Teammate 2: Database schema and migrations
Teammate 3: Frontend components
Teammate 4: Tests for all layers
Use Sonnet for each teammate.
```

### Research synthesis
```text
I'm designing [system]. Create an agent team to explore this from different angles:
one on UX, one on technical architecture, one playing devil's advocate.
```

---

## Limitations (Experimental)

| Limitation | Workaround |
|---|---|
| No session resumption for in-process teammates | Tell lead to spawn new teammates after `/resume` |
| Task status can lag | Check if work is done; update status manually or tell lead to nudge the teammate |
| Shutdown can be slow | Teammates finish current tool call before shutting down |
| One team per session | Clean up before starting a new team |
| No nested teams | Only the lead can spawn teammates |
| Lead is fixed | Can't promote a teammate or transfer leadership |
| Split panes need tmux or iTerm2 | Use in-process mode in VS Code, Windows Terminal, Ghostty |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Teammates not appearing | Press `Shift+Down` — they may be running but not visible |
| Too many permission prompts | Pre-approve common operations in permission settings before spawning |
| Teammate stopped on error | Navigate to them with `Shift+Down`, give instructions or spawn a replacement |
| Lead shuts down too early | Tell it to keep going or wait for teammates to finish |
| Orphaned tmux session | `tmux ls` → `tmux kill-session -t <session-name>` |

---

## Quick Reference Card

```
Enable:     CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
Min version: Claude Code v2.1.32
Sweet spot:  3–5 teammates, 5–6 tasks each
Navigate:   Shift+Down to cycle teammates
Task list:  Ctrl+T to toggle
Interrupt:  Escape to interrupt teammate's turn
Cleanup:    Always via lead, after shutting down teammates
Storage:    ~/.claude/teams/ and ~/.claude/tasks/
```
